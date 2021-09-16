package net.jlefever.seacap.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.seacap.StringUtils;
import net.jlefever.seacap.dump.models.Dep;

public class GetDepsByFilenames
{
    private final Sql2o db;

    public GetDepsByFilenames(Sql2o db)
    {
        this.db = db;
    }

    public List<Dep> call(int repoId, List<String> filenames, List<String> depKinds)
    {
        var sql = "SELECT D.id, D.source_id AS sourceId, D.target_id AS targetId, D.kind, D.weight "
                + "FROM deps D "
                + "JOIN entities SE ON SE.id = D.source_id "
                + "JOIN entities TE ON TE.id = D.target_id "
                + "JOIN filenames SFN ON SFN.entity_id = D.source_id "
                + "JOIN filenames TFN ON TFN.entity_id = D.target_id "
                + "WHERE D.kind = ANY('{" + StringUtils.join(",", depKinds) + "}') "
                + "AND SE.repo_id = :repo_id "
                + "AND TE.repo_id = :repo_id "
                + "AND SFN.filename = ANY('{" + StringUtils.join(",", filenames) + "}') "
                + "AND TFN.filename = ANY('{" + StringUtils.join(",", filenames) + "}')";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).addParameter("repo_id", repoId).executeAndFetch(Dep.class));
        }
    }
}
