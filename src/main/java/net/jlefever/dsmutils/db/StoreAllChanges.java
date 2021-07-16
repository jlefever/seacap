package net.jlefever.dsmutils.db;

import java.util.List;
import java.util.Objects;

import org.sql2o.Connection;

import net.jlefever.dsmutils.gitchurn.TreeChange;

public class StoreAllChanges implements DbCommand<Void>
{
    private final int repoId;
    private final List<TreeChange> changes;
    private final DbCommandCache cache;

    public StoreAllChanges(int repoId, List<TreeChange> changes)
    {
        this.repoId = repoId;
        this.changes = changes;
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

    private void insert(Connection con, Integer commitId, Integer parentId, int repoId, TreeChange change)
    {
        var id = this.cache.get(new StoreEntity(parentId, repoId, change.getName(), change.getRealKind()), con);

        new StoreChange(commitId, id, change.getChurn()).execute(con);

        for (var child : change.getChildren())
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
        return changes;
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
