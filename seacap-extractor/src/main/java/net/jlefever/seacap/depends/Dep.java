package net.jlefever.seacap.depends;

import java.util.Objects;

public class Dep
{
    private final ExternalEntity source;
    private final ExternalEntity target;
    private final String kind;

    public Dep(ExternalEntity source, ExternalEntity target, String kind)
    {
        this.source = source;
        this.target = target;
        this.kind = kind;
    }

    public ExternalEntity getSource()
    {
        return source;
    }

    public ExternalEntity getTarget()
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
