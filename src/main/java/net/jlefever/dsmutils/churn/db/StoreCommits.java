package net.jlefever.dsmutils.churn.db;

import java.util.Collection;

import org.sql2o.Sql2o;

public class StoreCommits {
    private final Sql2o db;

    public StoreCommits(Sql2o db)
    {
        this.db = db;
    }

    public void call(int repoId, Collection<String> sha1s)
    {
        var sql = "INSERT INTO commits (repo_id, sha1) VALUES (:repo_id, :sha1)";

        try (var con = this.db.open())
        {
            var query = con.createQuery(sql);

            for (var sha1 : sha1s)
            {
                query.addParameter("repo_id", repoId).addParameter("sha1", sha1).addToBatch();
            }

            query.executeBatch();
        }
    }
}
