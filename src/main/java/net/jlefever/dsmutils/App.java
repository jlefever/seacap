package net.jlefever.dsmutils;

import java.io.IOException;
import java.util.Arrays;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.churn.ChangeImpl;
import net.jlefever.dsmutils.churn.GetChanges;
import net.jlefever.dsmutils.churn.db.StoreChanges;
import net.jlefever.dsmutils.churn.db.StoreCommits;
import net.jlefever.dsmutils.ctags.TreeTagBuilder;
import net.jlefever.dsmutils.ctags.db.StoreRootTag;
import net.jlefever.dsmutils.db.RefreshMatViews;
import net.jlefever.dsmutils.db.StoreRepo;
import net.jlefever.dsmutils.depends.GetEntityIdMap;
import net.jlefever.dsmutils.depends.StoreAllDeps;
import net.jlefever.dsmutils.depends.external.GetDepsFromDepends;
import net.jlefever.dsmutils.git.GitDriver;
import net.jlefever.dsmutils.ir.EntityHasherImpl;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

public class App
{
    public static void main(String[] args) throws IOException, InterruptedException
    {
        var db = new Sql2o("jdbc:postgresql://localhost:5433/postgres", "postgres", "password");
        var pathFilter = new PathFilter(Arrays.asList("**/*.java"), Arrays.asList("**/src/test/**"));

        run(db, "deltaspike", "https://github.com/apache/deltaspike", "tags/deltaspike-1.9.5", pathFilter);
        // run(db, "flume", "https://github.com/apache/flume", "tags/release-1.9.0-rc3", pathFilter);
        // run(db, "hbase", "https://github.com/apache/hbase", "tags/rel/1.4.12", pathFilter);

        new RefreshMatViews(db).call();
    }

    private static void run(Sql2o db, String repoName, String repoUrl, String repoRev, PathFilter pathFilter)
            throws IOException, InterruptedException
    {
        System.out.println("Extracting from " + repoName + "...");

        var git = new GitDriver("git", ".assets");
        var repo = git.clone(repoUrl);
        git.checkout(repo, repoRev);
        var allowedPaths = git.lsFiles(repo, pathFilter);

        var flatChanges = new GetChanges(repo.getDir(), repoRev, pathFilter, 150, 30).execute();
        var builder = new TreeTagBuilder();
        var changes = flatChanges.stream().map(c -> new ChangeImpl<>(builder.add(c.getTag()), c.getRev(), c.getChurn())).collect(toList());
        var roots = builder.build();

        var repoId = new StoreRepo(db).call(repoName, repoUrl, repoUrl);

        for (var root : roots)
        {
            new StoreRootTag(db).call(repoId, root);
        }

        new StoreCommits(db).call(repoId, changes.stream().map(c -> c.getRev()).collect(toSet()));
        new StoreChanges(db, new EntityHasherImpl()).call(changes);

        try (var con = db.open())
        {
            var ids = new GetEntityIdMap(repoId).execute(con);
            var deps = new GetDepsFromDepends(repo.getDir(), "java").execute();
            new StoreAllDeps(deps, ids, allowedPaths).execute(con);
        }
    }
}
