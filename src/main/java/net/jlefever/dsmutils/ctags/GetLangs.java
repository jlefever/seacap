package net.jlefever.dsmutils.ctags;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class GetLangs
{
    public List<Lang> execute()
    {
        Process process;

        try
        {
            var args = Arrays.asList("ctags", "--machinable", "--list-kinds-full");
            process = new ProcessBuilder(args).start();
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        
        var reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

        var tagKinds = new HashMap<String, List<TagKind>>();

        reader.lines().forEach(line ->
        {
            var arr = line.split("\t");

            var langName = arr[0];
            var letter = arr[1].toCharArray()[0];
            var name = arr[2];
            var detail = arr[7];

            var tagKind = new TagKind(letter, name, detail);

            if (tagKinds.containsKey(langName))
            {
                tagKinds.get(langName).add(tagKind);
            }
            else
            {
                tagKinds.put(langName, new ArrayList<TagKind>(Arrays.asList(tagKind)));
            }
        });

        return tagKinds.entrySet().stream()
                       .map(e -> new Lang(e.getKey(), e.getValue()))
                       .collect(Collectors.toList());
    }
}
