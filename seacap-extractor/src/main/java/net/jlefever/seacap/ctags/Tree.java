package net.jlefever.seacap.ctags;

import java.util.List;

public interface Tree<T>
{
    T getInner();
    boolean hasParent();
    Tree<T> getParent();
    List<? extends Tree<T>> getChildren();
}
