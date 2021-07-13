package net.jlefever.dsmutils.gitchurn;

public class Tag
{
    private final String name;
    private final String kind;
    private final String path;
    private final String scope;
    private final String scopeKind;

    public Tag(String name, String kind, String path, String scope, String scopeKind)
    {
        this.name = name;
        this.kind = kind;
        this.path = path;
        this.scope = scope;
        this.scopeKind = scopeKind;
    }

    public String getName()
    {
        return this.name;
    }

    public String getKind()
    {
        return this.kind;
    }

    public String getPath()
    {
        return this.path;
    }

    public String getScope()
    {
        return this.scope;
    }

    public String getScopeKind()
    {
        return this.scopeKind;
    }
}
