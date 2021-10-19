package net.jlefever.seacap.git;

import java.io.File;
import java.io.IOException;

import com.google.common.base.Charsets;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;

public class GitDriver
{
    private final String rootDir;
    private final HashFunction hasher;

    public GitDriver(String rootDir)
    {
        this.rootDir = rootDir;
        this.hasher = Hashing.murmur3_128(0);
    }

    public Git clone(String url, String branch) throws GitAPIException, IOException
    {
        var dir = new File(getRepoDir(url));

        if (dir.exists())
        {
            var git = Git.open(dir);
            var command = git.checkout();
            command.setName(branch);
            command.call();
            return git;
        }

        var command = Git.cloneRepository();
        command.setBranch(branch);
        command.setURI(url);
        command.setDirectory(dir);
        return command.call();
    }

    private String getRepoDir(String url)
    {
        var name = hasher.hashString(url, Charsets.UTF_8).toString();
        return new File(this.rootDir, name).getAbsolutePath();
    }
}