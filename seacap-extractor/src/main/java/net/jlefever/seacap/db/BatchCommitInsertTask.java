package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

import net.jlefever.seacap.ir.Commit;

public class BatchCommitInsertTask implements BatchTask<Commit>
{
    private final IdMap<Commit> ids;

    public BatchCommitInsertTask(IdMap<Commit> ids)
    {
        this.ids = ids;
    }

    @Override
    public Query prepare(Connection con)
    {
        var sql = "INSERT INTO commits (id, sha1, msg, commit_time) "
                + "VALUES (:id, :sha1, :msg, :commit_time)";
        return con.createQuery(sql, false);
    }

    @Override
    public void add(Query query, Commit commit)
    {
        if (this.ids.contains(commit))
        {
            return;
        }

        query
            .addParameter("id", this.ids.assign(commit))
            .addParameter("sha1", commit.getHash())
            .addParameter("msg", commit.getMessage())
            .addParameter("commit_time", commit.getCommitTime())
            .addToBatch();
    }
}
