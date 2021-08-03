// package net.jlefever.dsmutils.churn;

// import java.util.ArrayList;
// import java.util.List;
// import java.util.stream.Collectors;
// import java.util.stream.Stream;

// import net.jlefever.dsmutils.ctags.Tag;
// import net.jlefever.dsmutils.ctags.TreeTag;
// import net.jlefever.dsmutils.ctags.TreeTagBuilder;

// public class TreeifyChanges
// {
//     public List<Change<TreeTag>> execute(Stream<Change<Tag>> records)
//     {
//         var trees = new ArrayList<Change<TreeTag>>();

//         var byCohort = records.collect(Collectors.groupingByConcurrent(TreeifyChanges::getCohort));

//         for (var cohort : byCohort.values())
//         {
//             var builder = new TreeTagBuilder();

//             for (var change : cohort)
//             {
//                 trees.add(new ChangeImpl<>(builder.add(change.getTag()), change.getRev(), change.getChurn()));
//             }

//             builder.refresh();

//             if (!builder.isValid())
//             {
//                 System.out.println("Warning: found an invalid tree");
//             }
//         }

//         return trees;
//     }

//     private static String getCohort(Change<Tag> change)
//     {
//         return change.getRev() + ":" + change.getTag().getPath();
//     }
// }
