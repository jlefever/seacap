package net.jlefever.dsmutils.ctags.db;

import org.sql2o.Connection;
import org.sql2o.Sql2o;

import net.jlefever.dsmutils.ctags.TreeTag;

public class StoreRootTag
{
    private final Sql2o db;

    public StoreRootTag(Sql2o db)
    {
        this.db = db;
    }

    public void call(int repoId, TreeTag tag)
    {
        if (tag.hasParent())
        {
            throw new RuntimeException("`tag` must be a root");
        }

        try (var con = this.db.open())
        {
            insert(con, repoId, null, tag);
        }
    }

    private void insert(Connection con, int repoId, Integer parentId, TreeTag tag)
    {
        var sql = "INSERT INTO entities (repo_id, parent_id, name, kind) "
                + "VALUES (:repo_id, :parent_id, :name, :kind) "
                + "RETURNING id";

        var id = con.createQuery(sql)
            .addParameter("repo_id", repoId)
            .addParameter("parent_id", parentId)
            .addParameter("name", tag.getInner().getName())
            .addParameter("kind", tag.getInner().getKind())
            .executeAndFetch(Integer.class)
            .get(0);

        for (var child : tag.getChildren())
        {
            insert(con, repoId, id, child);
        }
    }
}
