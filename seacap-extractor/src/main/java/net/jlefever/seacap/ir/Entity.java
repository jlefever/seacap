package net.jlefever.seacap.ir;

public interface Entity {
    boolean hasParent();
    Entity getParent();
    String getName();
    String getKind();
}
