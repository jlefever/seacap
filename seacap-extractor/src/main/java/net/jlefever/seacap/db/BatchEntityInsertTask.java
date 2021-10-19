package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

import net.jlefever.seacap.ctags.TreeTag;

public class BatchEntityInsertTask implements BatchTask<TreeTag>
{
    private final IdMap<TreeTag> ids;

    public BatchEntityInsertTask(IdMap<TreeTag> ids)
    {
        this.ids = ids;
    }

    @Override
    public Query prepare(Connection con)
    {
        var sql = "INSERT INTO entities (id, parent_id, name, kind) "
                + "VALUES (:id, :parent_id, :name, :kind)";

        return con.createQuery(sql, false);
    }

    @Override
    public void add(Query query, TreeTag tag)
    {
        this.addToBatch(query, tag.getRoot(), null);
    }

    private void addToBatch(Query query, TreeTag tag, Integer parentId)
    {
        var id = this.ids.get(tag);

        if (id == null)
        {
            id = this.ids.assign(tag);

            query
                .addParameter("id", id)
                .addParameter("parent_id", Integer.class, parentId)
                .addParameter("name", tag.getName())
                .addParameter("kind", tag.getRealKind())
                .addToBatch();
        }

        // Even if this tag was already inserted, we still may have to insert
        // some of its children.
        for (var child : tag.getChildren())
        {
            this.addToBatch(query, child, id);
        }
    }
}
