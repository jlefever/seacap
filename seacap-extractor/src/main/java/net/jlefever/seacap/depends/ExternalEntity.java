package net.jlefever.seacap.depends;

import java.util.Objects;

import net.jlefever.seacap.ir.Entity;

public class ExternalEntity implements Entity
{
    private final String name;
    private final String kind;
    private final ExternalEntity parent;

    public ExternalEntity(String name, String kind)
    {
        this(name, kind, null);
    }

    public ExternalEntity(String name, String kind, ExternalEntity parent)
    {
        this.name = name;
        this.kind = kind;
        this.parent = parent;
    }

    @Override
    public String getName()
    {
        return this.name;
    }

    @Override
    public String getKind()
    {
        return this.kind;
    }

    @Override
    public boolean hasParent()
    {
        return this.parent != null;
    }

    @Override
    public ExternalEntity getParent()
    {
        return this.parent;
    }

    public String getPath()
    {
        if (this.hasParent())
        {
            return this.getParent().getPath();
        }

        return this.getName();
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getParent(), getName(), getKind());
    }

    @Override
    public String toString()
    {
        if (!hasParent())
        {
            return getName();
        }

        return getParent() + " > " + getName() + " (" + getKind() + ")";
    }
}
