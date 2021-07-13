package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StoreRepo implements DbCommand<Integer>
{
    private final String name;
    private final String url;

    public StoreRepo(String name, String url)
    {
        this.name = name;
        this.url = url;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO repos (name, git_url) VALUES (:name, :url) RETURNING id";

        return con.createQuery(sql)
            .addParameter("name", this.getName())
            .addParameter("url", this.getUrl())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    public String getName()
    {
        return name;
    }

    public String getUrl()
    {
        return url;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getName(), this.getUrl());
    }
}
