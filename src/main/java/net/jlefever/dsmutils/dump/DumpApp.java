package net.jlefever.dsmutils.dump;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.apache.commons.io.FileUtils;
import org.sql2o.Sql2o;

import net.jlefever.dsmutils.dump.db.GetCrss;
import net.jlefever.dsmutils.dump.db.GetRepos;
import net.jlefever.dsmutils.dump.db.GetUifs;

public class DumpApp
{
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public static void main(String[] args) throws IOException
    {
        final Sql2o db = new Sql2o("jdbc:postgresql://localhost:5433/postgres", "postgres", "password");
        final String dumpDir = "dump";
        clean(dumpDir);

        var repos = new GetRepos(db).call();
        write(repos, Paths.get(dumpDir, "repos.json"));

        for (var repo : repos)
        {
            Files.createDirectory(Paths.get(dumpDir, repo.getName()));

            Files.createDirectory(Paths.get(dumpDir, repo.getName(), "uif"));
            for (var uif : new GetUifs(db).call(repo.getId()))
            {
                write(uif, Paths.get(dumpDir, repo.getName(), "uif", uif.getNum() + ".json"));
            }

            Files.createDirectory(Paths.get(dumpDir, repo.getName(), "crs"));
            for (var uif : new GetCrss(db).call(repo.getId()))
            {
                write(uif, Paths.get(dumpDir, repo.getName(), "crs", uif.getNum() + ".json"));
            }
        }
    }

    private static void clean(String dir)
    {
        try
        {
            if (Files.exists(Paths.get(dir)))
            {
                FileUtils.deleteDirectory(new File(dir));
            }

            Files.createDirectory(Paths.get(dir));
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    }

    private static void write(Object obj, Path path)
    {
        try
        {
            Files.createFile(path);
            Files.write(path, gson.toJson(obj).getBytes());
        } catch (IOException e)
        {
            e.printStackTrace();
        }
    }
}
