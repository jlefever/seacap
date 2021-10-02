package net.jlefever.seacap.db;

import java.util.Map;

public interface IdMap<T>
{
    boolean contains(T item);
    Integer get(T item);
    int assign(T item);
    Map<T, Integer> getUnderlyingMap();
}
