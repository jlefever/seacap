package net.jlefever.dsmutils.dump.models;

public class Entity {
    private final int id;
    private final Integer parentId;
    private final String name;
    private final String kind;
    
    public Entity(int id, Integer parentId, String name, String kind)
    {
        this.id = id;
        this.parentId = parentId;
        this.name = name;
        this.kind = kind;
    }

    public int getId()
    {
        return id;
    }

    public Integer getParentId()
    {
        return parentId;
    }

    public String getName()
    {
        return name;
    }

    public String getKind()
    {
        return kind;
    }
}
