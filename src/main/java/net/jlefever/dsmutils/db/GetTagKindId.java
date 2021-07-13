package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class GetTagKindId implements DbCommand<Integer>
{
    private final String langName;
    private final String tagKindName;

    public GetTagKindId(String langName, String tagKindName)
    {
        this.langName = langName;
        this.tagKindName = tagKindName;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "SELECT TK.id FROM tag_kinds TK "
                + "LEFT JOIN langs L ON TK.lang_id = L.id "
                + "WHERE TK.name = :tag_kind_name AND L.name = :lang_name";

        return con.createQuery(sql)
            .addParameter("tag_kind_name", this.getTagKindName())
            .addParameter("lang_name", this.getLangName())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    public String getLangName()
    {
        return langName;
    }

    public String getTagKindName()
    {
        return tagKindName;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getLangName(), this.getTagKindName());
    }
}
