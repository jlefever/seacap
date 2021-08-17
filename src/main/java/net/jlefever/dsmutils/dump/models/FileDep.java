package net.jlefever.dsmutils.dump.models;

import java.util.Objects;

import net.jlefever.dsmutils.clique.Edge;

public class FileDep implements Edge<String>
{
    private final String source;
    private final String target;

    public FileDep(String source, String target)
    {
        this.source = source;
        this.target = target;
    }

    public String getSource()
    {
        return this.source;
    }

    public String getTarget()
    {
        return this.target;
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getSource(), getTarget());
    }

    @Override
    public boolean equals(Object other)
    {
        return Objects.hashCode(this) == Objects.hashCode(other);
    }
}
