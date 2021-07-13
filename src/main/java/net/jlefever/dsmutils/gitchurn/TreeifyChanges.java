package net.jlefever.dsmutils.gitchurn;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class TreeifyChanges
{
    public List<TreeChange> execute(Stream<FlatChange> records)
    {
        var trees = new ArrayList<TreeChange>();

        var byCohort = records.collect(Collectors.groupingByConcurrent(TreeifyChanges::getCohort));

        for (var cohort : byCohort.values())
        {
            var builder = new TreeChangeBuilder();

            for (var change : cohort)
            {
                trees.add(builder.add(change));
            }

            builder.refresh();

            if (!builder.isValid())
            {
                System.out.println("Warning: found an invalid tree");
            }
        }

        return trees;
    }

    private static String getCohort(Change change)
    {
        return change.getRev() + ":" + change.getPath();
    }
}
