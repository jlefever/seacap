package net.jlefever.dsmutils.gitchurn;

public class FlatChange implements Change
{
    private final String name;
    private final String kind;
    private final String path;
    private final String scope;
    private final String scopeKind;
    private final String rev;
    private final int churn;

    public FlatChange(String name, String kind, String path, String scope, String scopeKind, String rev, int churn)
    {
        this.name = name;
        this.kind = kind;
        this.path = path;
        this.scope = scope;
        this.scopeKind = scopeKind;
        this.rev = rev;
        this.churn = churn;
    }

    public String getName()
    {
        return this.name;
    }

    public String getKind()
    {
        // Java-specific hack. Other languages may have similiar special-cases.
        if (this.kind.equals("enum"))
        {
            return "class";
        }

        return this.kind;
    }

    public String getRealKind()
    {
        return this.kind;
    }

    public String getPath()
    {
        return this.path;
    }

    public String getScope()
    {
        if (this.scope == null && !this.getKind().equals("file"))
        {
            return this.getPath();
        }

        return this.scope;
    }

    public String getRev()
    {
        return this.rev;
    }

    public int getChurn()
    {
        return this.churn;
    }

    public String getScopeKind()
    {
        if (this.scope == null && !this.getKind().equals("file"))
        {
            return "file";
        }

        // Java-specific hack. Other languages may have similiar special-cases.
        if (this.scopeKind.equals("enum"))
        {
            return "class";
        }

        return this.scopeKind;
    }

    public boolean hasScope()
    {
        return this.getScope() != null;
    }
}
