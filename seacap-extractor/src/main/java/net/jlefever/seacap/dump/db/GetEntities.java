package net.jlefever.seacap.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.seacap.dump.models.Entity;

public class GetEntities
{
    private final Sql2o db;

    public GetEntities(Sql2o db)
    {
        this.db = db;
    }

    public List<Entity> call(int repoId)
    {
        var sql = "SELECT id, parent_id AS parentId, name, kind, (linenos).a AS fromLineno, (linenos).b AS toLineno "
                + "FROM entities WHERE repo_id = :repo_id";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).addParameter("repo_id", repoId).executeAndFetch(Entity.class));
        }
    }
}