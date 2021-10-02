package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public interface BatchQuery<T>
{
    Query prepare(Connection con);
    void add(Query query, T item);
}
