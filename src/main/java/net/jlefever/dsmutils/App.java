package net.jlefever.dsmutils;

import java.io.IOException;
import java.util.Arrays;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.ctags.GetLangs;
import net.jlefever.dsmutils.db.StoreAllChanges;
import net.jlefever.dsmutils.db.StoreLang;
import net.jlefever.dsmutils.db.StoreRepo;
import net.jlefever.dsmutils.db.StoreTagKind;
import net.jlefever.dsmutils.depends.GetEntityIdMap;
import net.jlefever.dsmutils.depends.StoreAllDeps;
import net.jlefever.dsmutils.depends.external.GetDepsFromDepends;
import net.jlefever.dsmutils.git.GitDriver;
import net.jlefever.dsmutils.gitchurn.GetChanges;
import net.jlefever.dsmutils.gitchurn.TreeifyChanges;

public class App
{
    public static void main(String[] args) throws IOException, InterruptedException
    {
        final String repoName = "deltaspike";
        final String repoUrl = "https://github.com/apache/deltaspike";
        final String repoRev = "tags/deltaspike-1.9.5";
        final PathFilter pathFilter = new PathFilter(Arrays.asList("**/*.java"), Arrays.asList("**/src/test/**"));

        var git = new GitDriver("git", ".assets");
        var repo = git.clone(repoUrl);
        git.checkout(repo, repoRev);

        var db = new Sql2o("jdbc:postgresql://localhost:5433/postgres", "postgres", "password");
        var con = db.open();

        var repoId = new StoreRepo(repoName, repoUrl).execute(con);

        for (var lang : new GetLangs().execute())
        {
            var langId = new StoreLang(lang.getName()).execute(con);

            for (var kind : lang.getTagKinds())
            {
                new StoreTagKind(langId, kind.getLetter(), kind.getName(), kind.getDetail()).execute(con);
            }
        }

        var changes = new GetChanges(repo.getDir(), repoRev, pathFilter, 150, 30).execute();
        System.out.println(repo.getDir());
        var trees = new TreeifyChanges().execute(changes);
        new StoreAllChanges(repoId, trees).execute(con);

        var ids = new GetEntityIdMap(repoId).execute(con);
        var deps = new GetDepsFromDepends(repo.getDir(), "java").execute();
        new StoreAllDeps(deps, ids).execute(con);
    }
}
