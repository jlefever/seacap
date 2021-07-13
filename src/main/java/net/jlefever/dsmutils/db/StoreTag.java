package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StoreTag implements DbCommand<Integer>
{
    private final int pathId;
    private final int kindId;
    private final Integer parentId;
    private final String name;

    public StoreTag(int pathId, int kindId, Integer parentId, String name)
    {
        this.pathId = pathId;
        this.kindId = kindId;
        this.parentId = parentId;
        this.name = name;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO tags (path_id, parent_id, kind_id, name) "
                + "VALUES (:path_id, :parent_id, :kind_id, :name) "
                + "RETURNING id";

        return con.createQuery(sql)
            .addParameter("path_id", this.getPathId())
            .addParameter("parent_id", this.getParentId())
            .addParameter("kind_id", this.getKindId())
            .addParameter("name", this.getName())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    public int getPathId()
    {
        return pathId;
    }

    public int getKindId()
    {
        return kindId;
    }

    public Integer getParentId()
    {
        return parentId;
    }

    public String getName()
    {
        return name;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getPathId(), this.getKindId(), this.getParentId(), this.getName());
    }
}
