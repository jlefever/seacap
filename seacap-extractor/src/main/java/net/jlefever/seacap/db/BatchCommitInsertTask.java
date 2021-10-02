package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public class BatchCommitInsertTask implements BatchTask<String>
{
    private final IdMap<String> ids;

    public BatchCommitInsertTask(IdMap<String> ids)
    {
        this.ids = ids;
    }

    @Override
    public Query prepare(Connection con)
    {
        var sql = "INSERT INTO commits (id, sha1) VALUES (:id, :sha1)";
        return con.createQuery(sql, false);
    }

    @Override
    public void add(Query query, String sha1)
    {
        if (this.ids.contains(sha1))
        {
            return;
        }

        query
            .addParameter("id", this.ids.assign(sha1))
            .addParameter("sha1", sha1)
            .addToBatch();
    }
}
