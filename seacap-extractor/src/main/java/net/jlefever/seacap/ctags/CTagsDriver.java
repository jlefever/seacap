package net.jlefever.seacap.ctags;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

import org.apache.commons.lang.StringEscapeUtils;

public class CTagsDriver
{
    private final String bin;

    public CTagsDriver(String bin)
    {
        this.bin = bin;
    }

    public TreeTag generateTags(String filename, byte[] content) throws IOException
    {
        // Create array of args to launch ctags
        var args = new ArrayList<String>();
        args.add(this.bin);
        args.add("--_interactive");
        args.add("--fields=FzZNpen");
        args.add("--extras=+f");

        // Create "generate-tags" command string for ctags to be passed over stdin
        var outputBuilder = new StringBuilder();
        outputBuilder.append("{\"command\":\"generate-tags\", \"filename\":\"");
        outputBuilder.append(StringEscapeUtils.escapeJava(filename));
        outputBuilder.append("\", \"size\": ");
        outputBuilder.append(content.length);
        outputBuilder.append("}\n");

        // Start ctags and write the command to stdin
        var process = new ProcessBuilder(args).start();
        var outputStream = process.getOutputStream();
        outputStream.write(outputBuilder.toString().getBytes());
        outputStream.write(content);

        // Close the output stream which seems to be required to read the tags
        outputStream.flush();
        outputStream.close();

        // Read through the ctags output and create tags
        var treeTagBuilder = new TreeTagBuilder();
        var reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

        reader.lines().forEach(escapedLine ->
        {
            var line = StringEscapeUtils.unescapeJava(escapedLine);

            // TODO: Check for errors
            if (!line.startsWith("{\"_type\": \"tag\"")) return;

            var tag = TagImpl.fromJson(line);

            if (tag.getRealKind().equals("package")) return;

            treeTagBuilder.add(tag);
        });

        treeTagBuilder.build();
        var roots = treeTagBuilder.getRoots();

        // This is a bug and should be fixed if/when discovered.
        if (roots.size() != 1) throw new RuntimeException();

        return roots.get(0);
    }
}
