package net.jlefever.seacap.dump.models;

public class Dep
{
    private final int id;
    private final int sourceId;
    private final int targetId;
    private final int weight;
    private final String kind;

    public Dep(int id, int sourceId, int targetId, int weight, String kind)
    {
        this.id = id;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.weight = weight;
        this.kind = kind;
    }

    public int getId()
    {
        return id;
    }

    public int getSourceId()
    {
        return sourceId;
    }

    public int getTargetId()
    {
        return targetId;
    }

    public int getWeight()
    {
        return weight;
    }

    public String getKind()
    {
        return kind;
    }
}
