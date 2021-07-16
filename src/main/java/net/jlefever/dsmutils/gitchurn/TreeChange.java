package net.jlefever.dsmutils.gitchurn;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class TreeChange implements Change
{
    private final Change inner;
    private final List<TreeChange> children = new ArrayList<TreeChange>();
    private TreeChange parent = null;

    public TreeChange(Change inner)
    {
        this.inner = inner;
    }

    public String getName()
    {
        return this.inner.getName();
    }

    public String getFullName()
    {
        if (this.getKind().equals("file"))
        {
            return this.getName();
        }

        if (!this.hasParent() || this.getParent().getKind().equals("file"))
        {
            return this.getName();
        }

        return this.getParent().getFullName() + "." + this.getName();
    }

    public String getKind()
    {
        return this.inner.getKind();
    }

    public String getRealKind()
    {
        return this.inner.getRealKind();
    }

    public String getPath()
    {
        return this.inner.getPath();
    }

    public String getScope()
    {
        return this.inner.getScope();
    }

    public String getRev()
    {
        return this.inner.getRev();
    }

    public int getChurn()
    {
        return this.inner.getChurn();
    }

    public String getScopeKind()
    {
        return this.inner.getScopeKind();
    }

    public boolean hasScope()
    {
        return this.inner.hasScope();
    }

    public boolean isScopeOf(Change tag)
    {
        return Objects.equals(tag.getScope(), this.getFullName()) 
            && Objects.equals(tag.getScopeKind(), this.getKind());
    }

    public TreeChange getParent()
    {
        return parent;
    }

    public boolean hasParent()
    {
        return this.getParent() != null;
    }

    public List<TreeChange> getChildren()
    {
        return Collections.unmodifiableList(this.children);
    }

    public void setParent(TreeChange parent)
    {
        if (this.parent != null)
        {
            this.parent.children.remove(this);
        }

        this.parent = parent;
        this.parent.children.add(this);
    }
}
