package net.jlefever.seacap.db;

import org.sql2o.Sql2o;

public class StoreRepo
{
    private final Sql2o db;

    public StoreRepo(Sql2o db)
    {
        this.db = db;
    }

    public int call(String name, String gitUrl, String githubUrl, String leadRef)
    {
        var sql = "INSERT INTO repos (name, git_url, github_url, lead_ref) "
                + "VALUES (:name, :git_url, :github_url, :lead_ref) "
                + "RETURNING id";

        try (var con = this.db.open())
        {
            return con.createQuery(sql)
                .addParameter("name", name)
                .addParameter("git_url", gitUrl)
                .addParameter("github_url", githubUrl)
                .addParameter("lead_ref", leadRef)
                .executeAndFetch(Integer.class)
                .get(0);
        }
    }
}
