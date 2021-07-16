package net.jlefever.dsmutils.depends;

public class StoredEntity extends Entity
{
    private final int id;
    private final Integer parentId;
    private final String name;
    private final String kind;
    private StoredEntity parent;

    public StoredEntity(int id, Integer parentId, String name, String kind)
    {
        this.id = id;
        this.parentId = parentId;
        this.name = name;
        this.kind = kind;
        this.parent = null;
    }

    public int getId()
    {
        return this.id;
    }

    public Integer getParentId()
    {
        return this.parentId;
    }

    @Override
    public String getName()
    {
        return this.name;
    }

    @Override
    public String getKind()
    {
        if (this.kind.equals("annotation"))
        {
            return "type";
        }
        else if (this.kind.equals("class"))
        {
            return "type";
        }
        else if (this.kind.equals("enum"))
        {
            return "type";
        }
        else if (this.kind.equals("field"))
        {
            return "var";
        }
        else if (this.kind.equals("file"))
        {
            return "file";
        }
        else if (this.kind.equals("interface"))
        {
            return "type";
        }
        else if (this.kind.equals("method"))
        {
            return "function";
        }
        else if (this.kind.equals("package"))
        {
            return "package";
        }
        
        throw new RuntimeException();
    }

    @Override
    public boolean hasParent()
    {
        return this.getParentId() != null;
    }

    @Override
    public Entity getParent()
    {
        return this.parent;
    }

    public void setParent(StoredEntity parent)
    {
        this.parent = parent;
    }
}
