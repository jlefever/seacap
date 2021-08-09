package net.jlefever.dsmutils.ctags;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import net.jlefever.dsmutils.ir.Entity;

public class TreeTag implements Tree<Tag>, Tag, Entity
{
    private final Tag inner;
    private final List<TreeTag> children = new ArrayList<TreeTag>();
    private TreeTag parent;

    public TreeTag(Tag tag)
    {
        this.inner = tag;
    }

    public String getName()
    {
        return this.getInner().getName();
    }

    public String getKind()
    {
        return this.getInner().getKind();
    }

    public String getRealKind()
    {
        return this.getInner().getRealKind();
    }

    public String getPath()
    {
        return this.getInner().getPath();
    }

    public boolean hasScope()
    {
        return this.getInner().hasScope();
    }

    public String getScope()
    {
        return this.getInner().getScope();
    }

    public String getScopeKind()
    {
        return this.getInner().getScopeKind();
    }

    public Integer getLine()
    {
        return this.getInner().getLine();
    }

    public Integer getEnd()
    {
        return this.getInner().getEnd();
    }

    public Tag getInner()
    {
        return this.inner;
    }

    public List<TreeTag> getChildren()
    {
        return Collections.unmodifiableList(this.children);
    }

    public boolean hasParent()
    {
        return this.parent != null;
    }

    public TreeTag getParent()
    {
        return this.parent;
    }

    public void setParent(TreeTag treeTag)
    {
        if (this.hasParent())
        {
            this.parent.children.remove(this);
        }

        this.parent = treeTag;
        this.parent.children.add(this);
    }

    public String getFullName()
    {
        if (this.getInner().getKind().equals("file"))
        {
            return this.getInner().getName();
        }

        if (!this.hasParent() || this.getParent().getInner().getKind().equals("file"))
        {
            return this.getInner().getName();
        }

        return this.getParent().getFullName() + "." + this.getInner().getName();
    }

    public boolean isScopeOf(Tag tag)
    {
        return Objects.equals(tag.getPath(), this.getPath())
            && Objects.equals(tag.getScope(), this.getFullName())
            && Objects.equals(tag.getScopeKind(), this.getInner().getKind());
    }
}
