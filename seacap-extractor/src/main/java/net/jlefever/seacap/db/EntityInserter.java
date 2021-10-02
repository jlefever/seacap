package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

import net.jlefever.seacap.ctags.TreeTag;

public class EntityInserter implements Inserter<TreeTag>
{
    private final IdMap<TreeTag> ids;

    public EntityInserter(IdMap<TreeTag> ids)
    {
        this.ids = ids;
    }

    @Override
    public Query prepareCreateTable(Connection con)
    {
        var sql = "CREATE TABLE entities ("
                + "id INT PRIMARY KEY, "
                + "parent_id INT REFERENCES entities (id), "
                + "name TEXT NOT NULL, "
                + "kind TEXT NOT NULL, "
                + "start_lineno INT, "
                + "end_lineno INT, "
                + "UNIQUE (parent_id, name, kind)"
                + ")";

        return con.createQuery(sql, false);
    }

    @Override
    public Query prepareInsert(Connection con)
    {
        var sql = "INSERT INTO entities (id, parent_id, name, kind) "
                + "VALUES (:id, :parent_id, :name, :kind)";

        return con.createQuery(sql, false);
    }

    @Override
    public void addToBatch(Query query, TreeTag tag)
    {
        if (tag.hasParent())
        {
            throw new RuntimeException("`tag` must be a root");
        }

        if (!tag.getKind().equals("file"))
        {
            throw new RuntimeException("`tag` must be a file");
        }

        this.addToBatch(query, tag, null);
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
                .addParameter("kind", tag.getKind())
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
