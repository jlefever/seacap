package net.jlefever.seacap.dump.models;

import java.util.Objects;

import net.jlefever.seacap.clique.Edge;

public class DepEdge implements Edge<Integer>
{
    private final Dep dep;

    public DepEdge(Dep dep)
    {
        this.dep = dep;
    }

    public Integer getSource()
    {
        return this.dep.getSourceId();
    }

    public Integer getTarget()
    {
        return this.dep.getTargetId();
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
