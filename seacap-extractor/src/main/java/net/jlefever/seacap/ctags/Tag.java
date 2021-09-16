package net.jlefever.seacap.ctags;

public interface Tag
{
    String getName();
    String getKind();
    String getRealKind();
    String getPath();
    boolean hasScope();
    String getScope();
    String getScopeKind();
    Integer getLine();
    Integer getEnd();
}
