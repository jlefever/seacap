package net.jlefever.seacap.dump.models;

public class Entity {
    private final int id;
    private final Integer parentId;
    private final String name;
    private final String kind;
    private final Integer fromLineno;
    private final Integer toLineno;
    
    public Entity(int id, Integer parentId, String name, String kind, Integer fromLineno, Integer toLineno)
    {
        this.id = id;
        this.parentId = parentId;
        this.name = name;
        this.kind = kind;
        this.fromLineno = fromLineno;
        this.toLineno = toLineno;
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

    public Integer getFromLineno()
    {
        return fromLineno;
    }

    public Integer getToLineno()
    {
        return toLineno;
    }
}
