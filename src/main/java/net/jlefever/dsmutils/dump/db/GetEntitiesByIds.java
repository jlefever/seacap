package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.StringUtils;
import net.jlefever.dsmutils.dump.models.Entity;

public class GetEntitiesByIds
{
    private final Sql2o db;

    public GetEntitiesByIds(Sql2o db)
    {
        this.db = db;
    }

    public List<Entity> call(List<Integer> entityIds)
    {
        var sql = "SELECT id, parent_id AS parentId, name, kind, (linenos).a AS fromLineno, (linenos).b AS toLineno "
                + "FROM closed_entities_of_ids('{" + StringUtils.join(",", entityIds) + "}')";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).executeAndFetch(Entity.class));
        }
    }
}
