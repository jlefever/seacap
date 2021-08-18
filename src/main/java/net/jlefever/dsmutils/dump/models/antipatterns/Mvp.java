package net.jlefever.dsmutils.dump.models.antipatterns;

import java.util.List;

import net.jlefever.dsmutils.dump.models.Change;
import net.jlefever.dsmutils.dump.models.Entity;

public class Mvp implements AntiPattern
{
    private final MvpSummary summary;
    private List<Change> changes;
    private List<Entity> entities;

    public Mvp(MvpSummary summary)
    {
        this.summary = summary;
    }

    public MvpSummary getSummary()
    {
        return this.summary;
    }

    public int getNum()
    {
        return summary.getNum();
    }

    public String getX()
    {
        return summary.getX();
    }

    public String getY()
    {
        return summary.getY();
    }

    public int getCochange()
    {
        return summary.getCochange();
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
}
