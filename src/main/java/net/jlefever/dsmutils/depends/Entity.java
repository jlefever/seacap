package net.jlefever.dsmutils.depends;

import java.util.Objects;

public abstract class Entity {
    public abstract String getName();
    public abstract String getKind();
    public abstract String getPath();
    public abstract boolean hasParent();
    public abstract Entity getParent();

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getName(), getKind(), getPath(), getParent());
    }

    @Override
    public String toString()
    {
        var name = getName() + " (" + getKind() + ")";

        if (!hasParent())
        {
            return name;
        }

        return getParent().toString() + " > " + name;
    }
}
