package net.jlefever.dsmutils;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.ctags.GetLangs;
import net.jlefever.dsmutils.db.StoreAllChanges;
import net.jlefever.dsmutils.db.StoreLang;
import net.jlefever.dsmutils.db.StoreRepo;
import net.jlefever.dsmutils.db.StoreTagKind;
import net.jlefever.dsmutils.git.GitDriver;
import net.jlefever.dsmutils.gitchurn.GetChanges;
import net.jlefever.dsmutils.gitchurn.TreeifyChanges;

public class App
{
    public static void main(String[] args) throws IOException, InterruptedException
    {
        final String repoName = "deltaspike";
        final String repoUrl = "https://github.com/apache/deltaspike";

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

        var git = new GitDriver("git", ".assets");
        var repo = git.clone(repoUrl);
        git.checkout(repo, "tags/deltaspike-1.9.5");

        var whitelist = Arrays.asList("**/*.java");
        var blacklist = Arrays.asList("**/src/test/**");
        var changes = new GetChanges(repo.getDir(), "tags/deltaspike-1.9.5", whitelist,blacklist, 150, 30).execute();
        var trees = new TreeifyChanges().execute(changes);
        new StoreAllChanges(repoId, trees).execute(con);

        con.close();
    }
}
