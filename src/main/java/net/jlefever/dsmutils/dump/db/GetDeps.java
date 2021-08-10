package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.dump.models.Dep;

public class GetDeps
{
    private final Sql2o db;

    public GetDeps(Sql2o db)
    {
        this.db = db;
    }

    public List<Dep> call(int repoId)
    {
        var sql = "SELECT D.id, D.source_id AS sourceId, D.target_id AS targetId, D.kind, D.weight "
                + "FROM deps D "
                + "JOIN entities SE ON SE.id = D.source_id "
                + "JOIN entities TE ON TE.id = D.target_id "
                + "WHERE SE.repo_id = :repo_id OR TE.repo_id = :repo_id";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).addParameter("repo_id", repoId).executeAndFetch(Dep.class));
        }
    }
}
