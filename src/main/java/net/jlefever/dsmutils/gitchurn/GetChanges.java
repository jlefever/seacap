package net.jlefever.dsmutils.gitchurn;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import com.google.gson.Gson;

import net.jlefever.dsmutils.PathFilter;

public class GetChanges
{
    private final String dir;
    private final String rev;
    private final PathFilter pathFilter;
    private final int maxCommits;
    private final int maxCommitSize;

    public GetChanges(String dir, String rev, PathFilter pathFilter, int maxCommits, int maxCommitSize)
    {
        this.dir = dir;
        this.rev = rev;
        this.pathFilter = pathFilter;
        this.maxCommits = maxCommits;
        this.maxCommitSize = maxCommitSize;
    }

    public Stream<FlatChange> execute() throws IOException, InterruptedException
    {
        var args = new ArrayList<String>();
        args.add("gitchurn");
        args.add("--git-repo=" + this.getDir());
        args.add("--tag-format=json");
        args.add("--max-changes=" + this.getMaxCommitSize());

        var gitLogArgs = new StringBuilder();
        gitLogArgs.append(this.getRev() + " -n " + this.getMaxCommits() + " -- ");
        gitLogArgs.append(String.join(" ", getPathFilter().toArgs()));
        args.add("--git-log-args=" + gitLogArgs.toString());

        var process = new ProcessBuilder(args).start();
        var reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

        var gson = new Gson();

        var changes = new ArrayList<FlatChange>();

        reader.lines().forEach(line ->
        {
            var arr = line.split("\t");
            var rev = arr[0];
            var churn = Integer.parseInt(arr[1]);
            var tag = gson.fromJson(arr[2], Tag.class);

            if (tag.getKind().equals("file") || tag.getKind().equals("enumConstant"))
            {
                return;
            }

            changes.add(new FlatChange(tag.getName(),tag.getKind(), tag.getPath(), tag.getScope(), tag.getScopeKind(), rev, churn));
        });

        return changes.stream();
    }

    public String getDir()
    {
        return dir;
    }

    public String getRev()
    {
        return rev;
    }

    public PathFilter getPathFilter()
    {
        return pathFilter;
    }

    public int getMaxCommits()
    {
        return maxCommits;
    }

    public int getMaxCommitSize()
    {
        return maxCommitSize;
    }
}
