package net.jlefever.dsmutils.git;

import java.io.File;

import com.google.common.base.Charsets;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

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
