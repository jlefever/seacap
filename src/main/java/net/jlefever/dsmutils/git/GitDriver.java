package net.jlefever.dsmutils.git;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.google.common.base.Charsets;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

import net.jlefever.dsmutils.PathFilter;
import net.jlefever.dsmutils.ProcessUtils;

public class GitDriver
{
    private final String gitBin;
    private final String rootDir;
    private final HashFunction hasher;

    public GitDriver(String gitBin, String rootDir)
    {
        this.gitBin = gitBin;
        this.rootDir = rootDir;
        this.hasher = Hashing.murmur3_128(0);
    }

    public Repo clone(String url)
    {
        var repo = new Repo(url, getRepoDir(url));

        if (new File(repo.getDir()).exists())
        {
            return repo;
        }

        ProcessUtils.run(new ProcessBuilder(this.gitBin, "clone", url, repo.getDir()));
        return repo;
    }

    public List<String> lsFiles(Repo repo, PathFilter filter) throws IOException
    {
        var args = new ArrayList<String>(Arrays.asList(this.gitBin, "-C", repo.getDir(), "ls-files"));
        args.addAll(filter.toArgs());
        var process = new ProcessBuilder(args).start();
        var reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        return reader.lines().collect(Collectors.toList());
    }

    public void checkout(Repo repo, String ref)
    {
        ProcessUtils.run(new ProcessBuilder(this.gitBin, "-C", repo.getDir(), "checkout", ref));
    }

    private String getRepoDir(String url)
    {
        var name = hasher.hashString(url, Charsets.UTF_8).toString();
        return new File(this.rootDir, name).getAbsolutePath();
    }
}
