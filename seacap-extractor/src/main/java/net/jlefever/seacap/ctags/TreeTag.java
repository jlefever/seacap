package net.jlefever.seacap.ctags;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import net.jlefever.seacap.ir.Entity;

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

    public TreeTag getRoot()
    {
        if (this.hasParent())
        {
            return this.getParent().getRoot();
        }

        return this;
    }

    public List<TreeTag> flatten()
    {
        var flat = new ArrayList<TreeTag>();
        flat.add(this);

        for (var child : this.getChildren())
        {
            flat.addAll(child.flatten());
        }

        return flat;
    }

    public static List<TreeTag> flatten(List<TreeTag> tags)
    {
        var flat = new ArrayList<TreeTag>();

        for (var tag : tags)
        {
            flat.addAll(tag.flatten());
        }

        return flat;
    }

    public List<TreeTag> getInnermostTags(int lineno)
    {
        // This method assumes children are always bounded by their parent.
        // TODO: Too many ArrayList initializations

        var tags = new ArrayList<TreeTag>();

        if (!this.hasLineno(lineno))
        {
            return tags;
        }

        for (var child : this.getChildren())
        {
            tags.addAll(child.getInnermostTags(lineno));
        }

        if (tags.isEmpty())
        {
            // We are the innermost, so add ourself to the list.
            tags.add(this);
        }

        return tags;
    }

    public boolean hasLineno(int lineno)
    {
        // Sometimes `end` is missing. This seems like a bug with universal-ctags.
        // It seems this only happens for the last tag in the file.
        return lineno > this.getLine() && (this.getEnd() == null || lineno <= this.getEnd());
    }

    public boolean contains(TreeTag tag)
    {
        if (this.equals(tag)) return true;

        for (var child : this.getChildren())
        {
            if (child.contains(tag)) return true;
        }

        return false;
    }

    public boolean isScopeOf(Tag tag)
    {
        return Objects.equals(tag.getPath(), this.getPath()) && Objects.equals(tag.getScope(), this.getFullName())
                && Objects.equals(tag.getScopeKind(), this.getInner().getKind());
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getParent(), getName(), getRealKind());
    }
}
