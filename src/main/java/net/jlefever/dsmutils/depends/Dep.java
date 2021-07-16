package net.jlefever.dsmutils.depends;

import java.util.Objects;

public class Dep {
    private final Entity source;
    private final Entity target;
    private final String kind;

    public Dep(Entity source, Entity target, String kind)
    {
        this.source = source;
        this.target = target;
        this.kind = kind;
    }

    public Entity getSource()
    {
        return source;
    }

    public Entity getTarget()
    {
        return target;
    }

    public String getKind()
    {
        return kind;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getSource(), getTarget(), getKind());
    }

    @Override
    public String toString()
    {
        return getSource().toString() + " <" + getKind() + "> " + getTarget().toString();
    }
}
