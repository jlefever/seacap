package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.StringUtils;
import net.jlefever.dsmutils.dump.models.FileDep;

public class GetFileDeps
{
    private final Sql2o db;

    public GetFileDeps(Sql2o db)
    {
        this.db = db;
    }

    public List<FileDep> call(int repoId, List<String> depKinds)
    {
        var sql = "SELECT CD.src AS source, CD.tgt AS target "
                + "FROM find_fl_cdeps('{" + StringUtils.join(",", depKinds) + "}') CD "
                + "WHERE CD.dep_count > 0 AND CD.repo_id = :repo_id AND CD.src <> CD.tgt "
                + "ORDER BY source, target";

        try (var con = this.db.open())
        {
            return new ArrayList<>(con.createQuery(sql).addParameter("repo_id", repoId).executeAndFetch(FileDep.class));
        }
    }
}
