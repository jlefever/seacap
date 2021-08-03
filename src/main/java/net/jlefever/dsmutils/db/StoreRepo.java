package net.jlefever.dsmutils.db;

import org.sql2o.Sql2o;

public class StoreRepo
{
    private final Sql2o db;

    public StoreRepo(Sql2o db)
    {
        this.db = db;
    }

    public int call(String name, String url)
    {
        var sql = "INSERT INTO repos (name, git_url) VALUES (:name, :url) RETURNING id";

        try (var con = this.db.open())
        {
            return con.createQuery(sql)
                .addParameter("name", name)
                .addParameter("url", url)
                .executeAndFetch(Integer.class)
                .get(0);
        }
    }
}
