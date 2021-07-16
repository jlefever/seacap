package net.jlefever.dsmutils.depends;

import java.util.Objects;

public class Dep {
    private final Entity src;
    private final Entity dst;
    private final String kind;

    public Dep(Entity src, Entity dst, String kind)
    {
        this.src = src;
        this.dst = dst;
        this.kind = kind;
    }

    public Entity getSrc()
    {
        return src;
    }

    public Entity getDst()
    {
        return dst;
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
        return Objects.hash(getSrc(), getDst(), getKind());
    }

    @Override
    public String toString()
    {
        return getSrc().toString() + " <" + getKind() + "> " + getDst().toString();
    }
}
