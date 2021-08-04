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
    private List<Dep> outDeps;
    private List<Dep> evoOutDeps;

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

    public String getSrc()
    {
        return summary.getSrc();
    }

    public int getFanout()
    {
        return summary.getFanout();
    }

    public int getEvoFanout()
    {
        return summary.getEvoFanout();
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

    public List<Dep> getOutDeps()
    {
        return outDeps;
    }

    public void setOutDeps(List<Dep> outDeps)
    {
        this.outDeps = outDeps;
    }

    public List<Dep> getEvoOutDeps()
    {
        return evoOutDeps;
    }

    public void setEvoOutDeps(List<Dep> evoOutDeps)
    {
        this.evoOutDeps = evoOutDeps;
    }
}
