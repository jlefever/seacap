package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public class CreateChangeTableTask implements Task
{
    @Override
    public Query prepare(Connection con)
    {
        var sql = "CREATE TABLE changes ("
                + "id INT PRIMARY KEY, "
                + "entity_id INT REFERENCES entities (id) NOT NULL, "
                + "commit_id INT REFERENCES commits (id) NOT NULL, "
                + "churn INT NOT NULL, "
                + "UNIQUE (commit_id, entity_id)"
                + ")";

        return con.createQuery(sql, false);
    }
}
