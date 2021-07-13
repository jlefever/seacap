package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StoreCommit implements DbCommand<Integer>
{
    private final int repoId;
    private final String sha1;

    public StoreCommit(int repoId, String sha1)
    {
        this.repoId = repoId;
        this.sha1 = sha1;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO commits (repo_id, sha1) VALUES (:repo_id, :sha1) RETURNING id";

        return con
            .createQuery(sql)
            .addParameter("repo_id", this.getRepoId())
            .addParameter("sha1", this.getSha1())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    public int getRepoId()
    {
        return repoId;
    }

    public String getSha1()
    {
        return this.sha1;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getRepoId(), this.getSha1());
    }
}
