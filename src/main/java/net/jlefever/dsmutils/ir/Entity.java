package net.jlefever.dsmutils.ir;

public interface Entity {
    boolean hasParent();
    Entity getParent();
    String getName();
    String getKind();
}
