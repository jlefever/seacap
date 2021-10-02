package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public class CreateDepTableTask implements Task
{
    @Override
    public Query prepare(Connection con)
    {
        var sql = "CREATE TABLE deps ("
                + "id INT PRIMARY KEY, "
                + "source_id INT REFERENCES entities (id) NOT NULL, "
                + "target_id INT REFERENCES entities (id) NOT NULL, "
                + "kind TEXT NOT NULL, "
                + "weight INT NOT NULL, "
                + "UNIQUE (source_id, target_id, kind), "
                + "CHECK (weight > 0) "
                + ")";

        return con.createQuery(sql, false);
    }
}
