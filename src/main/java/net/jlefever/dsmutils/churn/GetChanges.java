package net.jlefever.dsmutils.churn;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;

import net.jlefever.dsmutils.PathFilter;
import net.jlefever.dsmutils.ctags.TagImpl;

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

    public List<Change<TagImpl>> execute() throws IOException, InterruptedException
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

        var changes = new ArrayList<Change<TagImpl>>();

        reader.lines().forEach(line ->
        {
            var arr = line.split("\t");
            var rev = arr[0];
            var churn = Integer.parseInt(arr[1]);
            var tag = gson.fromJson(arr[2], TagImpl.class);

            if (tag.getRealKind().equals("enumConstant") || tag.getRealKind().equals("package"))
            {
                return;
            }

            changes.add(new ChangeImpl<>(tag, rev, churn));
        });

        return changes;
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
