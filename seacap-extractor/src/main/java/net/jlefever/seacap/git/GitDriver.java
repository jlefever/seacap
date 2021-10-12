package net.jlefever.seacap.git;

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

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;

import net.jlefever.seacap.PathFilter;

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

    public Git clone(String url, String branch) throws GitAPIException, IOException
    {
        var dir = new File(getRepoDir(url));

        if (dir.exists())
        {
            var git     = Git.open(dir);
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

    public List<String> lsFiles(String dir, PathFilter filter) throws IOException
    {
        var args = new ArrayList<String>(Arrays.asList(this.gitBin, "-C", dir, "ls-files"));
        args.addAll(filter.toArgs());
        var process = new ProcessBuilder(args).start();
        var reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        return reader.lines().collect(Collectors.toList());
    }

    private String getRepoDir(String url)
    {
        var name = hasher.hashString(url, Charsets.UTF_8).toString();
        return new File(this.rootDir, name).getAbsolutePath();
    }
}