package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StoreLang implements DbCommand<Integer>
{
    private final String name;

    public StoreLang(String name)
    {
        this.name = name;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO langs (name) VALUES (:name) RETURNING id";
        
        return con.createQuery(sql)
            .addParameter("name", this.getName())
            .executeAndFetch(Integer.class)
            .get(0);
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
        return Objects.hash(this.getName());
    }
}
