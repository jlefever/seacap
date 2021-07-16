package net.jlefever.dsmutils.db;

import java.util.List;
import java.util.Objects;

import org.sql2o.Connection;

import net.jlefever.dsmutils.gitchurn.TreeChange;

public class StoreAllChanges implements DbCommand<Void>
{
    private final int repoId;
    private final List<TreeChange> tags;
    private final DbCommandCache cache;

    public StoreAllChanges(int repoId, List<TreeChange> changes)
    {
        this.repoId = repoId;
        this.tags = changes;
        this.cache = new DbCommandCache();
    }

    @Override
    public Void execute(Connection con)
    {
        for (var change : this.getChanges())
        {
            if (change.hasParent())
            {
                continue;
            }

            var commitId = this.cache.get(new StoreCommit(this.getRepoId(), change.getRev()), con);
            var pathId = this.cache.get(new StorePath(this.getRepoId(), change.getPath()), con);
            this.insert(con, commitId, pathId, null, change);
        }
        
        return null;
    }

    private void insert(Connection con, Integer commitId, Integer pathId, Integer parentId, TreeChange tag)
    {
        var kindId = this.cache.get(new GetTagKindId("Java", tag.getKind()), con);
        var id = this.cache.get(new StoreTag(pathId, kindId, parentId, tag.getName()), con);

        new StoreChange(commitId, id, tag.getChurn()).execute(con);

        for (var child : tag.getChildren())
        {
            this.insert(con, commitId, pathId, id, child);
        }
    }

    public int getRepoId()
    {
        return repoId;
    }

    public List<TreeChange> getChanges()
    {
        return tags;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(this.getRepoId(), this.getChanges());
    }
}
