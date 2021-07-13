package net.jlefever.dsmutils.db;

import org.sql2o.Connection;

public interface DbCommand<T> {
    T execute(Connection con);
}
