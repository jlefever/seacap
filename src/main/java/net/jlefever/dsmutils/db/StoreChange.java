package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StoreChange implements DbCommand<Integer>
{
    private final int commitId;
    private final int tagId;
    private final int churn;

    public StoreChange(int commitId, int tagId, int churn)
    {
        this.commitId = commitId;
        this.tagId = tagId;
        this.churn = churn;
    }

    public int getCommitId()
    {
        return commitId;
    }

    public int getTagId()
    {
        return tagId;
    }

    public int getChurn()
    {
        return churn;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO changes (commit_id, tag_id, churn) "
                + "VALUES (:commit_id, :tag_id, :churn) "
                + "RETURNING id";

        return con.createQuery(sql)
            .addParameter("commit_id", this.getCommitId())
            .addParameter("tag_id", this.getTagId())
            .addParameter("churn", this.getChurn())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getCommitId(), this.getTagId());
    }
}
