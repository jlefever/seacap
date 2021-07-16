package net.jlefever.dsmutils.gitchurn;

public interface Change
{
    String getName();
    String getKind();
    String getRealKind();
    String getPath();
    String getScope();
    String getScopeKind();
    boolean hasScope();

    String getRev();
    int getChurn();
}
