package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public class CreateEntityTableTask implements Task
{
    @Override
    public Query prepare(Connection con)
    {
        var sql = "CREATE TABLE entities ("
                + "id INT PRIMARY KEY, "
                + "parent_id INT REFERENCES entities (id), "
                + "name TEXT NOT NULL, "
                + "kind TEXT NOT NULL, "
                + "start_lineno INT, "
                + "end_lineno INT, "
                + "UNIQUE (parent_id, name, kind)"
                + ")";

        return con.createQuery(sql, false);
    }
}
