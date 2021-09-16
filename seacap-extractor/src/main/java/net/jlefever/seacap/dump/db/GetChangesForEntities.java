package net.jlefever.seacap.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.seacap.StringUtils;
import net.jlefever.seacap.dump.models.Change;

public class GetChangesForEntities
{
    private final Sql2o db;

    public GetChangesForEntities(Sql2o db)
    {
        this.db = db;
    }

    public List<Change> call(List<Integer> entityIds)
    {
        var sql = "SELECT CH.id, CH.entity_id AS entityId, CM.sha1 AS commitHash, CH.churn "
                + "FROM changes CH "
                + "JOIN commits CM ON CM.id = CH.commit_id "
                + "WHERE CH.entity_id IN (" + StringUtils.join(",", entityIds) + ")";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).executeAndFetch(Change.class));
        }
    }
}
