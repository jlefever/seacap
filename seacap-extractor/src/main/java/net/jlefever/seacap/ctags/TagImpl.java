package net.jlefever.seacap.ctags;

import java.util.Objects;

public class TagImpl implements Tag
{
    private final String name;
    private final String kind;
    private final String path;
    private final String scope;
    private final String scopeKind;
    private final Integer line;
    private final Integer end;

    public TagImpl(String name, String kind, String path, String scope, String scopeKind)
    {
        this(name, kind, path, scope, scopeKind, null, null);
    }

    public TagImpl(String name, String kind, String path, String scope, String scopeKind, Integer line, Integer end)
    {
        this.name = name;
        this.kind = kind;
        this.path = path;
        this.scope = scope;
        this.scopeKind = scopeKind;
        this.line = line;
        this.end = end;
    }

    public String getName()
    {
        if (this.kind.equals("file"))
        {
            return this.getPath();
        }
        
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

    public boolean hasScope()
    {
        return this.getScope() != null;
    }

    public String getScope()
    {
        if (this.scope == null && !this.getKind().equals("file"))
        {
            return this.getPath();
        }

        return this.scope;
    }

    public String getScopeKind()
    {
        if (this.scope == null && !this.getKind().equals("file"))
        {
            return "file";
        }

        if (this.scopeKind == null)
        {
            return null;
        }

        // Java-specific hack. Other languages may have similiar special-cases.
        if (this.scopeKind.equals("enum"))
        {
            return "class";
        }

        return this.scopeKind;
    }

    public Integer getLine()
    {
        return this.line;
    }

    public Integer getEnd()
    {
        return this.end;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getName(), getKind(), getPath(), getScope(), getScopeKind());
    }
}
