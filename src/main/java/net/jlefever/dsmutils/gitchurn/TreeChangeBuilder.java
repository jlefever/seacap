package net.jlefever.dsmutils.gitchurn;

import java.util.ArrayList;
import java.util.List;

public class TreeChangeBuilder
{
    private final List<TreeChange> trees = new ArrayList<TreeChange>();
    private boolean isDirty = false;

    public TreeChange add(Change tag)
    {
        var tree = new TreeChange(tag);
        this.trees.add(tree);
        this.isDirty = true;
        return tree;
    }

    public boolean isValid()
    {
        for (var tree : this.trees)
        {
            if (tree.hasScope() != tree.hasParent())
            {
                return false;
            }
        }

        return true;
    }

    public void refresh()
    {
        if (!this.isDirty)
        {
            return;
        }

        for (var orphan : this.trees)
        {
            if (orphan.hasParent())
            {
                continue;
            }

            for (var tree : this.trees)
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
}
