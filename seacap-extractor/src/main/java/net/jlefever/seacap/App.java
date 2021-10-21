package net.jlefever.seacap;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.ContentSource;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.diff.HistogramDiff;
import org.eclipse.jgit.errors.MissingObjectException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.util.io.DisabledOutputStream;
import org.sql2o.Sql2o;

import net.jlefever.seacap.ctags.CTagsDriver;
import net.jlefever.seacap.ctags.Change;
import net.jlefever.seacap.ctags.ChangeProvider;
import net.jlefever.seacap.ctags.TagCache;
import net.jlefever.seacap.ctags.TreeTag;
import net.jlefever.seacap.db.BatchChangeInsertTask;
import net.jlefever.seacap.db.BatchCommitInsertTask;
import net.jlefever.seacap.db.BatchDepInsertTask;
import net.jlefever.seacap.db.BatchEntityInsertTask;
import net.jlefever.seacap.db.BatchLinenoUpdateTask;
import net.jlefever.seacap.db.BatchMetaInsertTask;
import net.jlefever.seacap.db.BatchTaskRunner;
import net.jlefever.seacap.db.CreateChangeTableTask;
import net.jlefever.seacap.db.CreateCommitTableTask;
import net.jlefever.seacap.db.CreateDepTableTask;
import net.jlefever.seacap.db.CreateEntityTableTask;
import net.jlefever.seacap.db.CreateMetaTableTask;
import net.jlefever.seacap.db.IdMapImpl;
import net.jlefever.seacap.depends.GetDepsFromDepends;
import net.jlefever.seacap.git.GitDriver;
import net.jlefever.seacap.ir.Commit;

public class App
{
    public static void main(String[] args) throws IOException, InterruptedException, GitAPIException
    {
        var options = new Options();

        var input = new Option("p", "project", true, "input project yml");
        input.setRequired(true);
        options.addOption(input);

        var output = new Option("o", "output", true, "output sqlite database file");
        output.setRequired(true);
        options.addOption(output);

        var parser = new DefaultParser();
        var formatter = new HelpFormatter();
        CommandLine cmd = null;

        try
        {
            cmd = parser.parse(options, args);
        }
        catch (ParseException e)
        {
            System.out.println(e.getMessage());
            formatter.printHelp("seacap-extractor", options);
            System.exit(1);
        }

        var ymlFilePath = cmd.getOptionValue("project");
        var dbFilePath = cmd.getOptionValue("output");

        // Setup Git
        var cacheDir = Paths.get(System.getProperty("user.home"), ".seacap").toString();
        var driver = new GitDriver(cacheDir);

        // Load project yaml
        var project = Project.loadFromYaml(new FileInputStream(new File(ymlFilePath)));
        var pathFilter = project.getPathFilter();

        // Clone project
        System.out.println("Cloning repository...");
        var git = driver.clone(project.getGit(), project.getGitLeadRef());
        var repo = git.getRepository();
        var repoDir = repo.getDirectory().getParentFile().getAbsolutePath();

        // Collect historical information
        System.out.println("Fetching historical information...");
        var changes = calcChanges(repo, project.getGitLeadRef(), pathFilter);

        // Database
        clean(dbFilePath);
        var db = new Sql2o("jdbc:sqlite:" + dbFilePath, null, null);

        // Create tables
        System.out.println("Creating tables...");
        try (var con = db.open())
        {
            new CreateEntityTableTask().prepare(con).executeUpdate();
            new CreateCommitTableTask().prepare(con).executeUpdate();
            new CreateChangeTableTask().prepare(con).executeUpdate();
            new CreateDepTableTask().prepare(con).executeUpdate();
            new CreateMetaTableTask().prepare(con).executeUpdate();
        }

        // Create batch runner
        var runner = new BatchTaskRunner(db);

        // Insert historical entities
        System.out.println("Inserting historical entities...");
        var entities = changes.stream().map(c -> c.getTag()).collect(toList());
        var entityIds = new IdMapImpl<TreeTag>();
        runner.run(new BatchEntityInsertTask(entityIds), entities);

        // Insert commits
        System.out.println("Inserting commits...");
        var commits = changes.stream().map(c -> c.getRev()).collect(toSet());
        var commitIds = new IdMapImpl<Commit>();
        runner.run(new BatchCommitInsertTask(commitIds), commits);

        // Insert changes
        System.out.println("Inserting changes...");
        var changeIds = new IdMapImpl<Change<TreeTag, Commit>>();
        runner.run(new BatchChangeInsertTask(changeIds, entityIds, commitIds), changes);

        // Fetch current entities
        System.out.println("Fetching current entities...");
        var currEntities = TreeTag.flatten(caclCurrentEntities(repo, project.getGitLeadRef(), pathFilter));

        // Insert current entities
        System.out.println("Inserting current entities...");
        runner.run(new BatchEntityInsertTask(entityIds), currEntities);

        // Insert line numbers
        System.out.println("Inserting line numbers...");
        runner.run(new BatchLinenoUpdateTask(entityIds), currEntities);

        // Fetch dependencies
        System.out.println("Fetching dependencies...");
        var deps = new GetDepsFromDepends().call(repoDir, "java", pathFilter);

        // Insert dependencies
        System.out.println("Inserting dependencies...");
        runner.run(new BatchDepInsertTask(entityIds, currEntities), deps.entrySet());

        // Insert project info
        System.out.println("Inserting project info...");
        runner.run(new BatchMetaInsertTask(), Arrays.asList(project));
    }

    private static void clean(String dir)
    {
        if (Files.exists(Paths.get(dir)))
        {
            new File(dir).delete();
        }
    }

    private static List<TreeTag> caclCurrentEntities(Repository repo, String branch, PathFilter filter) throws IOException
    {
        var ref = repo.getRefDatabase().findRef(branch);
        var objectId = ref.getLeaf().getObjectId();

        RevTree tree = null;

        try (var walk = new RevWalk(repo))
        {
            tree = walk.parseCommit(objectId).getTree();
        }

        var contentSource = ContentSource.create(repo.newObjectReader());

        var tags = new ArrayList<TreeTag>();

        try (var walk = new TreeWalk(repo))
        {
            walk.setRecursive(true);
            var pos = walk.addTree(tree);

            while (walk.next())
            {
                var path = walk.getPathString();

                if (!filter.allowed(path))
                {
                    continue;
                }

                var id = walk.getObjectId(pos);

                var driver = new CTagsDriver("ctags");

                try
                {
                    var loader = contentSource.open(path, id);
                    tags.add(driver.generateTags(path, loader.getCachedBytes()));
                }
                catch (MissingObjectException e)
                {
                    // Might be a submodule
                }
            }
        }

        return tags;
    }

    private static List<Change<TreeTag, Commit>> calcChanges(Repository repo, String branch, PathFilter filter)
            throws IOException
    {
        var changes = new ArrayList<Change<TreeTag, Commit>>();

        var ref = repo.getRefDatabase().findRef(branch);
        var objectId = ref.getLeaf().getObjectId();
        var walk = new RevWalk(repo);
        walk.markStart(walk.parseCommit(objectId));

        var objectReader = repo.newObjectReader();
        var contentSource = ContentSource.create(objectReader);

        var tagCache = new TagCache(new CTagsDriver("ctags"));

        var formatter = new DiffFormatter(DisabledOutputStream.INSTANCE);
        formatter.setReader(objectReader, repo.getConfig());
        formatter.setDetectRenames(false);
        formatter.setDiffAlgorithm(new HistogramDiff());

        for (var commit : walk)
        {
            if (commit.getParentCount() != 1)
            {
                continue;
            }

            var changeProvider = new ChangeProvider<Commit>(Commit.fromRevCommit(commit));

            var tree = commit.getTree();
            var parent = commit.getParents()[0];
            var parentTree = parent.getTree();

            var files = formatter.scan(parentTree, tree);

            // System.out.println(commit.getId());

            for (var file : files)
            {
                if (!filter.allowed(file.getOldPath()))
                {
                    continue;
                }

                var oldId = file.getOldId().toObjectId();
                var newId = file.getNewId().toObjectId();

                // System.out.println(file);

                TreeTag treeTagA = null, treeTagB = null;

                if (!oldId.equals(ObjectId.zeroId()))
                {
                    try
                    {
                        var loader = contentSource.open(file.getOldPath(), oldId);
                        treeTagA = tagCache.get(oldId, file.getOldPath(), loader.getCachedBytes());
                    }
                    catch (MissingObjectException e)
                    {
                        // Might be a submodule
                    }
                }

                if (!newId.equals(ObjectId.zeroId()))
                {
                    try
                    {
                        var loader = contentSource.open(file.getNewPath(), newId);
                        treeTagB = tagCache.get(newId, file.getNewPath(), loader.getCachedBytes());
                    }
                    catch (MissingObjectException e)
                    {
                        // Might be a submodule
                    }
                }

                var editList = formatter.toFileHeader(file).toEditList();
                changes.addAll(changeProvider.get(treeTagA, treeTagB, editList));
            }

            // System.out.println();
        }

        formatter.close();
        objectReader.close();
        walk.close();

        return changes;
    }
}
