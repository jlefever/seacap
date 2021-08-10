package net.jlefever.dsmutils.dump.models.antipatterns;

import java.util.List;

import net.jlefever.dsmutils.dump.models.Change;
import net.jlefever.dsmutils.dump.models.Dep;
import net.jlefever.dsmutils.dump.models.Entity;

public class Crs implements AntiPattern
{
    private final CrsSummary summary;
    private List<Change> changes;
    private List<Entity> entities;
    private List<Dep> outDeps;
    private List<Dep> evoOutDeps;
    private List<Dep> inDeps;
    private List<Dep> evoInDeps;

    public Crs(CrsSummary summary)
    {
        this.summary = summary;
    }

    public CrsSummary getSummary()
    {
        return summary;
    }

    public int getNum()
    {
        return summary.getNum();
    }

    public String getCenter()
    {
        return summary.getCenter();
    }

    public int getFanout()
    {
        return summary.getFanout();
    }

    public int getEvoFanout()
    {
        return summary.getEvoFanout();
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
