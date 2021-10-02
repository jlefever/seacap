package net.jlefever.seacap.db;

import org.sql2o.Query;

public interface BatchTask<T> extends Task
{
    void add(Query query, T item);
}
