package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public interface Inserter<T>
{
    Query prepareCreateTable(Connection con);
    Query prepareInsert(Connection con);
    void addToBatch(Query query, T item);
}
