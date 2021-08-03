package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.StringUtils;
import net.jlefever.dsmutils.dump.models.Dep;

public class GetDeps
{
    private final Sql2o db;

    public GetDeps(Sql2o db)
    {
        this.db = db;
    }

    public List<Dep> call(List<Integer> depIds)
    {
        var sql = "SELECT id, source_id AS sourceId, target_id AS targetId, kind, weight "
                + "FROM deps WHERE id IN (" + StringUtils.join(",", depIds) + ")";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).executeAndFetch(Dep.class));
        }
    }
}
