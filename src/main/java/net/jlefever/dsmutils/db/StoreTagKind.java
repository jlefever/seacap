package net.jlefever.dsmutils.db;

import java.util.Objects;

import org.sql2o.Connection;

public class StoreTagKind implements DbCommand<Integer>
{
    private final int langId;
    private final char letter;
    private final String name;
    private final String detail;

    public StoreTagKind(int langId, char letter, String name, String detail)
    {
        this.langId = langId;
        this.letter = letter;
        this.name = name;
        this.detail = detail;
    }

    @Override
    public Integer execute(Connection con)
    {
        var sql = "INSERT INTO tag_kinds (lang_id, letter, name, detail) "
                + "VALUES (:lang_id, :letter, :name, :detail) "
                + "RETURNING id";
        
        return con.createQuery(sql)
            .addParameter("lang_id", this.getLangId())
            .addParameter("letter", String.valueOf(this.getLetter()))
            .addParameter("name", this.getName())
            .addParameter("detail", this.getDetail())
            .executeAndFetch(Integer.class)
            .get(0);
    }

    public int getLangId()
    {
        return langId;
    }

    public char getLetter()
    {
        return letter;
    }

    public String getName()
    {
        return name;
    }

    public String getDetail()
    {
        return detail;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getLangId(), this.getLetter(), this.getName(), this.getDetail());
    }
}
