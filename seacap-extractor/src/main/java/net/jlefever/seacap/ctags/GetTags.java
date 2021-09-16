package net.jlefever.seacap.ctags;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;

public class GetTags
{
    private final String ctagsBin;

    public GetTags(String ctagsBin)
    {
        this.ctagsBin = ctagsBin;
    }

    public TreeTagBuilder call(String dir, List<String> paths) throws IOException
    {
        var args = new ArrayList<String>();
        args.add(this.ctagsBin);
        args.add("--output-format=json");
        args.add("--fields=FzZNpen");
        args.add("--extras=+f");
        args.addAll(paths);

        var builder = new ProcessBuilder(args);
        builder.directory(new File(dir));
        var process = builder.start();

        var reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        var gson = new Gson();

        var tags = new TreeTagBuilder();

        reader.lines().forEach(line ->
        {
            var tag = gson.fromJson(line, TagImpl.class);

            if (tag.getRealKind().equals("package"))
            {
                return;
            }

            tags.add(tag);
        });

        tags.build();
        return tags;
    }
}
