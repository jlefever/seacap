package net.jlefever.seacap.churn;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;

import net.jlefever.seacap.PathFilter;
import net.jlefever.seacap.ctags.TagImpl;

public class GetChanges
{
    public List<Change<TagImpl>> call(String dir, String ref, PathFilter pathFilter, int maxCommits)
            throws IOException, InterruptedException
    {
        var args = new ArrayList<String>();
        args.add("gitchurn");
        args.add("--git-repo=" + dir);
        args.add("--tag-format=json");

        var gitLogArgs = new StringBuilder();
        gitLogArgs.append(ref);

        if (maxCommits > 0)
        {
            gitLogArgs.append(" -n " + maxCommits);
        }

        gitLogArgs.append(" -- ");
        gitLogArgs.append(String.join(" ", pathFilter.toArgs()));
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

            if (tag.getRealKind().equals("package"))
            {
                return;
            }

            changes.add(new ChangeImpl<>(tag, rev, churn));
        });

        return changes;
    }
}
