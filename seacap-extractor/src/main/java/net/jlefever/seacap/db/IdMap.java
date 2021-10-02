package net.jlefever.seacap.db;

public interface IdMap<T>
{
    boolean contains(T item);
    Integer get(T item);
    int assign(T item);
}
