package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StorePath implements DbCommand<Integer>
{
    private final int repoId;
    private final String name;

    public StorePath(int repoId, String name)
    {
        this.repoId = repoId;
        this.name = name;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO paths (name, repo_id) VALUES (:name, :repo_id) RETURNING id";

        return con
            .createQuery(sql)
            .addParameter("name", this.getName())
            .addParameter("repo_id", this.getRepoId())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    public int getRepoId()
    {
        return repoId;
    }

    public String getName()
    {
        return this.name;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getRepoId(), this.getName());
    }
}
