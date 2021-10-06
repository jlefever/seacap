package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public class CreateMetaTableTask implements Task
{
    @Override
    public Query prepare(Connection con)
    {
        var sql = "CREATE TABLE meta ("
                + "key TEXT PRIMARY KEY, "
                + "value TEXT NOT NULL"
                + ")";

        return con.createQuery(sql, false);
    }
}
