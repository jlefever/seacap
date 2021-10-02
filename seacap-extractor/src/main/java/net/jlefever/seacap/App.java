package net.jlefever.seacap;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.sql2o.Sql2o;

import net.jlefever.seacap.churn.Change;
import net.jlefever.seacap.churn.ChangeImpl;
import net.jlefever.seacap.churn.GetChanges;
import net.jlefever.seacap.ctags.GetTags;
import net.jlefever.seacap.ctags.TreeTag;
import net.jlefever.seacap.ctags.TreeTagBuilder;
import net.jlefever.seacap.db.BulkInserter;
import net.jlefever.seacap.db.ChangeInserter;
import net.jlefever.seacap.db.CommitInserter;
import net.jlefever.seacap.db.DepInserter;
import net.jlefever.seacap.db.EntityInserter;
import net.jlefever.seacap.db.IdMapImpl;
import net.jlefever.seacap.db.LineRangeInserter;
import net.jlefever.seacap.depends.GetDepsFromDepends;
import net.jlefever.seacap.git.GitDriver;

public class App
{
    public static void main(String[] args) throws IOException, InterruptedException
    {
        // Git
        var cacheDir = Paths.get(System.getProperty("user.home"), ".seacap").toString();
        var git = new GitDriver("git", cacheDir);

        // Load project yaml
        var project = Project.loadFromYaml(new FileInputStream(new File("examples/depends.yml")));

        // Clone project
        System.out.println("Cloning repository...");
        var repo = git.clone(project.getGit());

        // Collect historical information
        System.out.println("Fetching historical information...");
        var flatChanges = new GetChanges().call(repo.getDir(), project.getGitLeadRef(), project.getPathFilter(),
                project.getGitMaxCommits());
        var builder = new TreeTagBuilder();
        var changes = flatChanges.stream().map(c -> new ChangeImpl<>(builder.add(c.getTag()), c.getRev(), c.getChurn()))
                .collect(toList());
        builder.build();
        var entities = builder.getRoots();

        // Database
        var dbFilename = "sample.db";
        clean(dbFilename);
        var db = new Sql2o("jdbc:sqlite:" + dbFilename, null, null);

        // Insert historical entities
        System.out.println("Inserting historical entities...");
        var entityIds = new IdMapImpl<TreeTag>();
        new BulkInserter<>(db, new EntityInserter(entityIds)).insertAll(entities);

        // Insert commits
        System.out.println("Inserting commits...");
        var commits = changes.stream().map(c -> c.getRev()).collect(toSet());
        var commitIds = new IdMapImpl<String>();
        new BulkInserter<>(db, new CommitInserter(commitIds)).insertAll(commits);

        // Insert changes
        System.out.println("Inserting changes...");
        var changeIds = new IdMapImpl<Change<TreeTag>>();
        new BulkInserter<>(db, new ChangeInserter(changeIds, entityIds, commitIds)).insertAll(changes);

        // Insert current entities
        System.out.println("Fetching current entities...");
        git.checkout(repo, project.getGitLeadRef());
        var paths = git.lsFiles(repo, project.getPathFilter());
        var builder2 = new GetTags("ctags").call(repo.getDir(), paths);
        System.out.println("Inserting current entities...");
        new BulkInserter<>(db, new EntityInserter(entityIds)).insertAll(builder2.getRoots(), false);

        // Insert line numbers
        System.out.println("Inserting line numbers...");
        new BulkInserter<>(db, new LineRangeInserter(entityIds)).insertAll(builder2.getTrees(), false);

        // Insert dependencies
        System.out.println("Fetching dependencies...");
        var deps = new GetDepsFromDepends().call(repo.getDir(), "java", paths);
        System.out.println("Inserting dependencies...");
        new BulkInserter<>(db, new DepInserter(entityIds, builder2.getTrees())).insertAll(deps.entrySet());
    }

    private static void clean(String dir)
    {
        if (Files.exists(Paths.get(dir)))
        {
            new File(dir).delete();
        }
    }
}
