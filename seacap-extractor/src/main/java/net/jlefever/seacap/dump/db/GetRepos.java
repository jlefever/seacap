package net.jlefever.seacap.dump.db;

import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.seacap.dump.models.Repo;

public class GetRepos
{
    private final Sql2o db;

    public GetRepos(Sql2o db)
    {
        this.db = db;
    }

    public List<Repo> call()
    {
        var sql = "SELECT id, name, github_url AS githubUrl, lead_ref AS leadRef FROM repos";

        try (var con = this.db.open())
        {
            return con.createQuery(sql).executeAndFetch(Repo.class);
        }
    }
}
