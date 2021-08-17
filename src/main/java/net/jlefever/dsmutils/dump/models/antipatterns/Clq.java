package net.jlefever.dsmutils.dump.models.antipatterns;

import java.util.List;

import net.jlefever.dsmutils.dump.models.Change;
import net.jlefever.dsmutils.dump.models.Dep;
import net.jlefever.dsmutils.dump.models.Entity;

public class Clq implements AntiPattern
{
    private final ClqSummary summary;
    private List<Change> changes;
    private List<Entity> entities;
    private List<Dep> deps;

    public Clq(ClqSummary summary)
    {
        this.summary = summary;
    }

    public ClqSummary getSummary()
    {
        return summary;
    }

    public int getNum()
    {
        return summary.getNum();
    }

    public List<String> getMembers()
    {
        return summary.getMembers();
    }

    public List<List<Integer>> getSubCliques()
    {
        return summary.getSubCliques();
    }

    public List<Change> getChanges()
    {
        return changes;
    }

    public void setChanges(List<Change> changes)
    {
        this.changes = changes;
    }

    public List<Entity> getEntities()
    {
        return entities;
    }

    public void setEntities(List<Entity> entities)
    {
        this.entities = entities;
    }

    public List<Dep> getDeps()
    {
        return deps;
    }

    public void setDeps(List<Dep> outDeps)
    {
        this.deps = outDeps;
    }
}
