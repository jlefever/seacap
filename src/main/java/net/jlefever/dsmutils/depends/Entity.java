package net.jlefever.dsmutils.depends;

import java.util.Objects;

public abstract class Entity {
    public abstract String getName();
    public abstract String getKind();
    public abstract boolean hasParent();
    public abstract Entity getParent();

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
        return Objects.hash(getName(), getKind(), getParent());
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
