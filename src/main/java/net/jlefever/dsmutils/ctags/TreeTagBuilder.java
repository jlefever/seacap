package net.jlefever.dsmutils.ctags;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TreeTagBuilder
{
    private final Map<TagImpl, TreeTag> trees = new HashMap<TagImpl, TreeTag>();

    public TreeTag add(TagImpl tag)
    {
        if (this.trees.containsKey(tag))
        {
            return this.trees.get(tag);
        }

        var tree = new TreeTag(tag);
        this.trees.put(tag, tree);
        return tree;
    }

    public void build()
    {
        refresh();

        if (!isValid())
        {
            throw new RuntimeException("Found invalid tree");
        }
    }

    public Collection<TreeTag> getRoots()
    {
        return findRoots();
    }

    public Collection<TreeTag> getTrees()
    {
        return this.trees.values();
    }

    private void refresh()
    {
        var cohorts = this.trees.values().stream().collect(Collectors.groupingBy(x -> x.getPath()));

        for (var cohort : cohorts.values())
        {
            refreshCohort(cohort);
        }
    }

    private void refreshCohort(List<TreeTag> cohort)
    {
        var queue = new LinkedList<TreeTag>();

        for (var tag : cohort)
        {
            if (!tag.hasScope())
            {
                queue.add(tag);
            }
        }

        while (!queue.isEmpty())
        {
            var parent = queue.poll();

            for (var tag : cohort)
            {
                if (!tag.hasParent() && parent.isScopeOf(tag))
                {
                    tag.setParent(parent);
                    queue.push(tag);
                }
            }
        }
    }

    private List<TreeTag> findRoots()
    {
        var roots = new ArrayList<TreeTag>();

        for (var root : this.trees.values())
        {
            if (root.hasParent())
            {
                continue;
            }

            roots.add(root);
        }

        return roots;
    }

    private boolean isValid()
    {
        for (var tree : this.trees.values())
        {
            if (tree.hasScope() != tree.hasParent())
            {
                return false;
            }
        }

        return true;
    }
}
