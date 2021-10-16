package net.jlefever.seacap;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

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
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.util.io.DisabledOutputStream;

import net.jlefever.seacap.ctags.CTagsDriver;
import net.jlefever.seacap.git.GitDriver;

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
        var leadRef = project.getGitLeadRef();
        var pathFilter = project.getPathFilter();

        // Clone project
        System.out.println("Cloning repository...");
        var git = driver.clone(project.getGit(), project.getGitLeadRef());
        var repo = git.getRepository();
        var repoDir = repo.getDirectory().getParentFile().getAbsolutePath();
        doSomething(repo, project.getGitLeadRef(), pathFilter);
    }

    private static void clean(String dir)
    {
        if (Files.exists(Paths.get(dir)))
        {
            new File(dir).delete();
        }
    }

    private static void doSomething(Repository repo, String branch, PathFilter filter) throws IOException
    {
        var ref = repo.getRefDatabase().findRef(branch);
        var objectId = ref.getLeaf().getObjectId();
        var walk = new RevWalk(repo);
        walk.markStart(walk.parseCommit(objectId));

        var objectReader = repo.newObjectReader();
        var contentSource = ContentSource.create(objectReader);

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

            var tree = commit.getTree();
            var parent = commit.getParents()[0];
            var parentTree = parent.getTree();

            var files = formatter.scan(parentTree, tree);

            System.out.println(commit.getId());

            for (var file : files)
            {
                if (!filter.allowed(file.getOldPath()))
                {
                    continue;
                }

                var oldId = file.getOldId().toObjectId();
                var newId = file.getNewId().toObjectId();

                System.out.println(file);
                // System.out.println(oldId);
                // System.out.println(newId);

                if (!oldId.equals(ObjectId.zeroId()))
                {
                    try
                    {
                        var loader = contentSource.open(file.getOldPath(), oldId);
                        var bytes = loader.getCachedBytes();
                        new CTagsDriver("ctags").generateTags(file.getOldPath(), bytes);

                        // loader.copyTo(System.out);
                        // System.out.println();
                        // System.out.println(new String(loader.getBytes(),
                        // StandardCharsets.UTF_8));
                    }
                    catch (MissingObjectException e)
                    {
                        // Might be a submodule
                    }
                }

                // var header = formatter.toFileHeader(file);
                // var editList = header.toEditList();

                // for (var edit : editList) {
                // System.out.println(edit);
                // }
            }

            System.out.println();
        }

        formatter.close();
        objectReader.close();
        walk.close();
    }
}
