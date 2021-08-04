package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.StringUtils;
import net.jlefever.dsmutils.dump.models.Entity;

public class GetEntitiesOfDeps
{
    private final Sql2o db;

    public GetEntitiesOfDeps(Sql2o db)
    {
        this.db = db;
    }

    public List<Entity> call(List<Integer> depIds)
    {
        var sql = "SELECT id, parent_id AS parentId, name, kind "
                + "FROM closed_entities_of('{" + StringUtils.join(",", depIds) + "}')";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).executeAndFetch(Entity.class));
        }
    }
}