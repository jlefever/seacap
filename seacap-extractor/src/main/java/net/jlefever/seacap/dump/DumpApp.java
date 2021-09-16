package net.jlefever.seacap.dump;

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

import net.jlefever.seacap.dump.db.GetUifs;
import net.jlefever.seacap.dump.db.GetChanges;
import net.jlefever.seacap.dump.db.GetClqs;
import net.jlefever.seacap.dump.db.GetCrss;
import net.jlefever.seacap.dump.db.GetDepKinds;
import net.jlefever.seacap.dump.db.GetDeps;
import net.jlefever.seacap.dump.db.GetEntities;
import net.jlefever.seacap.dump.db.GetEntityKinds;
import net.jlefever.seacap.dump.db.GetMvps;
import net.jlefever.seacap.dump.db.GetRepos;

public class DumpApp
{
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public static void main(String[] args) throws IOException
    {
        final Sql2o db = new Sql2o("jdbc:postgresql://localhost:5433/postgres", "postgres", "password");
        final String dumpDir = "../.dump";
        clean(dumpDir);

        var repos = new GetRepos(db).call();
        write(repos, Paths.get(dumpDir, "repos.json"));

        write(new GetEntityKinds(db).call(), Paths.get(dumpDir, "entity_kinds.json"));
        write(new GetDepKinds(db).call(), Paths.get(dumpDir, "dep_kinds.json"));

        for (var repo : repos)
        {
            // Create dir
            var repoPath = Paths.get(dumpDir, repo.getName());
            Files.createDirectory(repoPath);

            // Export models
            write(new GetEntities(db).call(repo.getId()), repoPath.resolve("entities.json"));
            write(new GetDeps(db).call(repo.getId()), repoPath.resolve("deps.json"));
            write(new GetChanges(db).call(repo.getId()), repoPath.resolve("changes.json"));

            // Unstable Interfaces
            Files.createDirectory(repoPath.resolve("uif"));
            var uifs = new GetUifs(db).call(repo.getId());

            for (var uif : uifs)
            {
                write(uif, repoPath.resolve(Paths.get("uif", uif.getNum() + ".json")));
            }

            var uifSums = uifs.stream().map(u -> u.getSummary()).collect(Collectors.toList());
            write(uifSums, repoPath.resolve(Paths.get("uif", "index.json")));

            // Crossings
            Files.createDirectory(repoPath.resolve("crs"));
            var crss = new GetCrss(db).call(repo.getId());
            
            for (var crs : crss)
            {
                write(crs, repoPath.resolve(Paths.get("crs", crs.getNum() + ".json")));
            }

            var crsSums = crss.stream().map(c -> c.getSummary()).collect(Collectors.toList());
            write(crsSums, repoPath.resolve(Paths.get("crs", "index.json")));

            // Cliques
            Files.createDirectory(repoPath.resolve("clq"));
            var clqs = new GetClqs(db).call(repo.getId());
            
            for (var clq : clqs)
            {
                write(clq, repoPath.resolve(Paths.get("clq", clq.getNum() + ".json")));
            }

            var clqSums = clqs.stream().map(c -> c.getSummary()).collect(Collectors.toList());
            write(clqSums, repoPath.resolve(Paths.get("clq", "index.json")));

            // MVPs
            Files.createDirectory(repoPath.resolve("mvp"));
            var mvps = new GetMvps(db).call(repo.getId());
            
            for (var mvp : mvps)
            {
                write(mvp, repoPath.resolve(Paths.get("mvp", mvp.getNum() + ".json")));
            }

            var mvpSums = mvps.stream().map(m -> m.getSummary()).collect(Collectors.toList());
            write(mvpSums, repoPath.resolve(Paths.get("mvp", "index.json")));
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