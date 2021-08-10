package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

public class GetEntityKinds
{
    private final Sql2o db;

    public GetEntityKinds(Sql2o db)
    {
        this.db = db;
    }

    public List<String> call()
    {
        var sql = "SELECT DISTINCT kind FROM entities ORDER BY kind";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).executeAndFetch(String.class));
        }
    }
}
