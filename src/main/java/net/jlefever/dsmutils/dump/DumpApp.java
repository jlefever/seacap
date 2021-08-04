package net.jlefever.dsmutils.dump;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;

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

            // Unstable Interfaces
            Files.createDirectory(Paths.get(dumpDir, repo.getName(), "uif"));
            var uifs = new GetUifs(db).call(repo.getId());

            for (var uif : uifs)
            {
                write(uif, Paths.get(dumpDir, repo.getName(), "uif", uif.getNum() + ".json"));
            }

            var uifSums = uifs.stream().map(u -> u.getSummary()).collect(Collectors.toList());
            write(uifSums, Paths.get(dumpDir, repo.getName(), "uif", "index.json"));

            // Crossings
            Files.createDirectory(Paths.get(dumpDir, repo.getName(), "crs"));
            var crss = new GetCrss(db).call(repo.getId());
            
            for (var crs : crss)
            {
                write(crs, Paths.get(dumpDir, repo.getName(), "crs", crs.getNum() + ".json"));
            }

            var crsSums = crss.stream().map(c -> c.getSummary()).collect(Collectors.toList());
            write(crsSums, Paths.get(dumpDir, repo.getName(), "crs", "index.json"));
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
