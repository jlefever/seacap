package net.jlefever.seacap.ctags.db;

import org.sql2o.Connection;
import org.sql2o.Sql2o;

import net.jlefever.seacap.ctags.TreeTag;

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

        if (!tag.getKind().equals("file"))
        {
            throw new RuntimeException("`tag` must be a file");
        }

        try (var con = this.db.open())
        {
            insertFile(con, repoId, tag);
        }
    }

    private void insertFile(Connection con, int repoId, TreeTag tag)
    {
        var id = con.createQuery("SELECT insert_file(:name, :repo_id)")
                    .addParameter("repo_id", repoId)
                    .addParameter("name", tag.getInner().getName())
                    .executeAndFetch(Integer.class).get(0);

        for (var child : tag.getChildren())
        {
            insertChild(con, repoId, id, child);
        }
    }

    private void insertChild(Connection con, int repoId, int parentId, TreeTag tag)
    {
        var sql = "SELECT insert_child_entity(:parent_id, :kind, :name, :repo_id)";

        var id = con.createQuery(sql)
                    .addParameter("repo_id", repoId)
                    .addParameter("name", tag.getInner().getName())
                    .addParameter("parent_id", parentId)
                    .addParameter("kind", tag.getInner().getKind())
                    .executeAndFetch(Integer.class).get(0);

        for (var child : tag.getChildren())
        {
            insertChild(con, repoId, id, child);
        }
    }
}
