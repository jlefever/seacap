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
            this.insert(con, commitId, null, this.getRepoId(), change);
        }
        
        return null;
    }

    private void insert(Connection con, Integer commitId, Integer parentId, int repoId, TreeChange tag)
    {
        var id = this.cache.get(new StoreTag(parentId, repoId, tag.getName(), tag.getRealKind()), con);

        new StoreChange(commitId, id, tag.getChurn()).execute(con);

        for (var child : tag.getChildren())
        {
            this.insert(con, commitId, id, repoId, child);
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
