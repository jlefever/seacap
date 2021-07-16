package net.jlefever.dsmutils.depends;

public class DependsEntity extends Entity
{
    private final String name;
    private final String kind;
    private final String path;
    private final DependsEntity parent;

    public DependsEntity(String name, String kind, String path)
    {
        this(name, kind, path, null);
    }

    public DependsEntity(String name, String kind, String path, DependsEntity parent)
    {
        this.name = name;
        this.kind = kind;
        this.path = path;
        this.parent = parent;
    }

    @Override
    public String getName()
    {
        return this.name;
    }

    @Override
    public String getKind()
    {
        return this.kind;
    }

    @Override
    public String getPath()
    {
        return this.path;
    }

    @Override
    public boolean hasParent()
    {
        return this.parent != null;
    }

    @Override
    public Entity getParent()
    {
        return this.parent;
    }
}
