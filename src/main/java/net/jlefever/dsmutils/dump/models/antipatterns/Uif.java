package net.jlefever.dsmutils.dump.models.antipatterns;

import java.util.List;

import net.jlefever.dsmutils.dump.models.Change;
import net.jlefever.dsmutils.dump.models.Dep;
import net.jlefever.dsmutils.dump.models.Entity;

public class Uif implements AntiPattern
{
    private final int num;
    private final String src;
    private final int fanout;
    private final int evoFanout;
    private final int size;
    private List<Change> changes;
    private List<Entity> entities;
    private List<Dep> outDeps;
    private List<Dep> evoOutDeps;

    public Uif(int num, String src, int fanout, int evoFanout, int size)
    {
        this.num = num;
        this.src = src;
        this.fanout = fanout;
        this.evoFanout = evoFanout;
        this.size = size;
    }

    public int getNum()
    {
        return num;
    }

    public String getSrc()
    {
        return src;
    }

    public int getFanout()
    {
        return fanout;
    }

    public int getEvoFanout()
    {
        return evoFanout;
    }

    public int getSize()
    {
        return size;
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
