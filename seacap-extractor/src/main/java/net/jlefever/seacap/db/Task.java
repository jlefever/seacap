package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public interface Task
{
    Query prepare(Connection con);
}
