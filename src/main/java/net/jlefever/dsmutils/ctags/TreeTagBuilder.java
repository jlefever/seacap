package net.jlefever.dsmutils.ctags;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TreeTagBuilder
{
    private final Map<TagImpl, TreeTag> trees = new HashMap<TagImpl, TreeTag>();
    private boolean isDirty = false;

    public TreeTag add(TagImpl tag)
    {
        if (this.trees.containsKey(tag))
        {
            return this.trees.get(tag);
        }

        var tree = new TreeTag(tag);
        this.trees.put(tag, tree);
        this.isDirty = true;
        return tree;
    }

    public List<TreeTag> build()
    {
        refresh();

        if (!isValid())
        {
            throw new RuntimeException("Found invalid tree");
        }

        return findRoots();
    }

    private void refresh()
    {
        if (!this.isDirty)
        {
            return;
        }

        for (var orphan : this.trees.values())
        {
            if (orphan.hasParent())
            {
                continue;
            }

            for (var tree : this.trees.values())
            {
                if (!tree.isScopeOf(orphan))
                {
                    continue;
                }

                // Could there be more than one parent?
                orphan.setParent(tree);
                this.refresh();
                return;
            }
        }

        this.isDirty = false;
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
