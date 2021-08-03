package net.jlefever.dsmutils.ctags;

public interface Tag
{
    String getName();
    String getKind();
    String getRealKind();
    String getPath();
    boolean hasScope();
    String getScope();
    String getScopeKind();
}
