package net.jlefever.dsmutils.dump.models.antipatterns;

import java.util.List;

import net.jlefever.dsmutils.dump.models.Change;
import net.jlefever.dsmutils.dump.models.Dep;
import net.jlefever.dsmutils.dump.models.Entity;

public class Uif implements AntiPattern
{
    private final UifSummary summary;
    private List<Change> changes;
    private List<Entity> entities;
    private List<Dep> inDeps;
    private List<Dep> evoInDeps;

    public Uif(UifSummary summary)
    {
        this.summary = summary;
    }

    public UifSummary getSummary()
    {
        return this.summary;
    }

    public int getNum()
    {
        return summary.getNum();
    }

    public String getTgt()
    {
        return summary.getTgt();
    }

    public int getFanin()
    {
        return summary.getFanin();
    }

    public int getEvoFanin()
    {
        return summary.getEvoFanin();
    }

    public int getSize()
    {
        return summary.getSize();
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

    public List<Dep> getInDeps()
    {
        return inDeps;
    }

    public void setInDeps(List<Dep> inDeps)
    {
        this.inDeps = inDeps;
    }

    public List<Dep> getEvoInDeps()
    {
        return evoInDeps;
    }

    public void setEvoInDeps(List<Dep> evoInDeps)
    {
        this.evoInDeps = evoInDeps;
    }
}
