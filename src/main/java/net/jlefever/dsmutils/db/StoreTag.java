package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StoreTag implements DbCommand<Integer>
{
    private final Integer parentId;
    private final int repoId;
    private final String name;
    private final String kind;

    public StoreTag(Integer parentId, int repoId, String name, String kind)
    {
        this.parentId = parentId;
        this.repoId = repoId;
        this.name = name;
        this.kind = kind;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO tags (parent_id, repo_id, name, kind) "
                + "VALUES (:parent_id, :repo_id, :name, :kind) "
                + "RETURNING id";

        return con.createQuery(sql)
            .addParameter("parent_id", this.getParentId())
            .addParameter("repo_id", this.getRepoId())
            .addParameter("name", this.getName())
            .addParameter("kind", this.getKind())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    public Integer getParentId()
    {
        return parentId;
    }

    public int getRepoId()
    {
        return repoId;
    }

    public String getName()
    {
        return name;
    }

    public String getKind()
    {
        return kind;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getParentId(), this.getName(), this.getKind());
    }
}
