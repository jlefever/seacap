package net.jlefever.seacap;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.sql2o.Sql2o;

import net.jlefever.seacap.churn.Change;
import net.jlefever.seacap.churn.ChangeImpl;
import net.jlefever.seacap.churn.GetChanges;
import net.jlefever.seacap.ctags.GetTags;
import net.jlefever.seacap.ctags.TreeTag;
import net.jlefever.seacap.ctags.TreeTagBuilder;
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

public class App
{
    public static void main(String[] args) throws IOException, InterruptedException
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
        var git = new GitDriver("git", cacheDir);

        // Load project yaml
        var project = Project.loadFromYaml(new FileInputStream(new File(ymlFilePath)));
        var leadRef = project.getGitLeadRef();
        var pathFilter = project.getPathFilter();

        // Clone project
        System.out.println("Cloning repository...");
        var repo = git.clone(project.getGit());

        // Collect historical information
        System.out.println("Fetching historical information...");
        var flatChanges = new GetChanges().call(repo.getDir(), leadRef, pathFilter, project.getGitMaxCommits());
        var builder = new TreeTagBuilder();
        flatChanges.forEach(c -> builder.add(c.getTag()));
        var changes = flatChanges.stream().map(c -> new ChangeImpl<>(builder.add(c.getTag()), c.getRev(), c.getChurn()))
                .collect(toList());
        builder.build();
        var entities = builder.getRoots();

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
        var entityIds = new IdMapImpl<TreeTag>();
        runner.run(new BatchEntityInsertTask(entityIds), entities);

        // Insert commits
        System.out.println("Inserting commits...");
        var commits = changes.stream().map(c -> c.getRev()).collect(toSet());
        var commitIds = new IdMapImpl<String>();
        runner.run(new BatchCommitInsertTask(commitIds), commits);

        // Insert changes
        System.out.println("Inserting changes...");
        var changeIds = new IdMapImpl<Change<TreeTag>>();
        runner.run(new BatchChangeInsertTask(changeIds, entityIds, commitIds), changes);

        // Fetch current entities
        System.out.println("Fetching current entities...");
        git.checkout(repo, leadRef);
        var paths = git.lsFiles(repo, pathFilter);
        var builder2 = new GetTags("ctags").call(repo.getDir(), paths);

        // Insert current entities
        System.out.println("Inserting current entities...");
        runner.run(new BatchEntityInsertTask(entityIds), builder2.getRoots());

        // Insert line numbers
        System.out.println("Inserting line numbers...");
        runner.run(new BatchLinenoUpdateTask(entityIds), builder2.getTreeTags());

        // Fetch dependencies
        System.out.println("Fetching dependencies...");
        var deps = new GetDepsFromDepends().call(repo.getDir(), "java", paths);

        // Insert dependencies
        System.out.println("Inserting dependencies...");
        runner.run(new BatchDepInsertTask(entityIds, builder2.getTreeTags()), deps.entrySet());

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
}
