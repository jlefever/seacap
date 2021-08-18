package net.jlefever.dsmutils;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

import java.io.IOException;
import java.util.Arrays;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.churn.ChangeImpl;
import net.jlefever.dsmutils.churn.GetChanges;
import net.jlefever.dsmutils.churn.db.StoreChanges;
import net.jlefever.dsmutils.churn.db.StoreCommits;
import net.jlefever.dsmutils.ctags.GetTags;
import net.jlefever.dsmutils.ctags.TreeTagBuilder;
import net.jlefever.dsmutils.ctags.db.StoreRootTag;
import net.jlefever.dsmutils.ctags.db.UpdateLinenos;
import net.jlefever.dsmutils.db.RefreshMatViews;
import net.jlefever.dsmutils.db.StoreRepo;
import net.jlefever.dsmutils.depends.GetDepsFromDepends;
import net.jlefever.dsmutils.depends.StoreDeps;
import net.jlefever.dsmutils.git.GitDriver;
import net.jlefever.dsmutils.ir.EntityHasherImpl;

public class App
{
    public static void main(String[] args) throws IOException, InterruptedException
    {
        var db = new Sql2o("jdbc:postgresql://localhost:5433/postgres", "postgres", "password");
        var pathFilter = new PathFilter(Arrays.asList("**/*.java"), Arrays.asList("**/src/test/**"));

        run(db, "deltaspike", "https://github.com/apache/deltaspike", "tags/deltaspike-1.9.5", pathFilter);
        run(db, "flume", "https://github.com/apache/flume", "tags/release-1.9.0-rc3", pathFilter);
        run(db, "hbase", "https://github.com/apache/hbase", "tags/rel/1.4.12", pathFilter);
        run(db, "knox", "https://github.com/apache/knox", "tags/v1.3.0-release", pathFilter);
        run(db, "nifi", "https://github.com/apache/nifi", "tags/rel/nifi-1.10.0", pathFilter);
        run(db, "oozie", "https://github.com/apache/oozie", "tags/release-5.2.0", pathFilter);
        run(db, "qpid-broker", "https://github.com/apache/qpid-broker-j", "tags/7.1.6", pathFilter);
        run(db, "qpid-jms", "https://github.com/apache/qpid-jms-amqp-0-x", "tags/6.3.4", pathFilter);
        run(db, "tajo", "https://github.com/apache/attic-tajo", "tags/release-0.12.0-rc0", pathFilter);
        run(db, "tez", "https://github.com/apache/tez", "tags/rel/release-0.9.2", pathFilter);

        new RefreshMatViews(db).call();
    }

    private static void run(Sql2o db, String repoName, String repoUrl, String repoRev, PathFilter pathFilter)
            throws IOException, InterruptedException
    {
        System.out.println("Extracting from " + repoName + "...");

        System.out.println("Cloning...");
        var git = new GitDriver("git", ".assets");
        var repo = git.clone(repoUrl);
        git.checkout(repo, repoRev);
        var allowedPaths = git.lsFiles(repo, pathFilter);

        System.out.println("Using gitchurn to calculate changes...");
        var flatChanges = new GetChanges(repo.getDir(), repoRev, pathFilter, 500, 30).execute();
        var builder = new TreeTagBuilder();
        var changes = flatChanges.stream().map(c -> new ChangeImpl<>(builder.add(c.getTag()), c.getRev(), c.getChurn())).collect(toList());
        builder.build();

        System.out.println("Storing changes...");
        var repoId = new StoreRepo(db).call(repoName, repoUrl, repoUrl, repoRev);

        for (var root : builder.getRoots())
        {
            new StoreRootTag(db).call(repoId, root);
        }

        new StoreCommits(db).call(repoId, changes.stream().map(c -> c.getRev()).collect(toSet()));
        new RefreshMatViews(db).call();
        new StoreChanges(db, new EntityHasherImpl()).call(changes);

        System.out.println("Storing existing ctags...");
        var tags = new GetTags("ctags").call(repo.getDir(), allowedPaths);
        
        for (var root : tags.getRoots())
        {
            new StoreRootTag(db).call(repoId, root);
        }

        System.out.println("Updating line numbers...");
        new RefreshMatViews(db).call();
        new UpdateLinenos(db, new EntityHasherImpl()).call(tags.getTrees());

        System.out.println("Running depends...");
        var deps = new GetDepsFromDepends().call(repo.getDir(), "java", allowedPaths);
        new StoreDeps(db, new EntityHasherImpl()).call(deps);
    }
}
