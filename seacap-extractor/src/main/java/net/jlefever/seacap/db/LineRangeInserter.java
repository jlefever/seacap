package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

import net.jlefever.seacap.ctags.TreeTag;

public class LineRangeInserter implements Inserter<TreeTag>
{
    private final IdMap<TreeTag> ids;

    public LineRangeInserter(IdMap<TreeTag> ids)
    {
        this.ids = ids;
    }

    @Override
    public Query prepareCreateTable(Connection con)
    {
        return con.createQuery("SELECT 0", false);
    }

    @Override
    public Query prepareInsert(Connection con)
    {
        var sql = "UPDATE entities SET start_lineno = :start, end_lineno = :end "
                + "WHERE id = :id";

        return con.createQuery(sql, false);
    }

    @Override
    public void addToBatch(Query query, TreeTag tag)
    {
        var id = this.ids.get(tag);

        if (id == null)
        {
            throw new RuntimeException("`tag` must already be inserted");
        }

        if (tag.getLine() == null)
        {
            throw new RuntimeException("`tag.getLine()` must be non-null");
        }

        if (tag.getEnd() == null)
        {
            throw new RuntimeException("`tag.getEnd()` must be non-null");
        }

        query
            .addParameter("id", id)
            .addParameter("start", tag.getLine())
            .addParameter("end", tag.getEnd())
            .addToBatch();
    }
}
