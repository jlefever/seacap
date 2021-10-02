package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

import net.jlefever.seacap.churn.Change;
import net.jlefever.seacap.ctags.TreeTag;

public class ChangeInserter implements Inserter<Change<TreeTag>>
{
    private final IdMap<Change<TreeTag>> ids;
    private final IdMap<TreeTag> entityIds;
    private final IdMap<String> commitIds;

    public ChangeInserter(IdMap<Change<TreeTag>> ids, IdMap<TreeTag> entityIds, IdMap<String> commitIds)
    {
        this.ids = ids;
        this.entityIds = entityIds;
        this.commitIds = commitIds;
    }

    @Override
    public Query prepareCreateTable(Connection con)
    {
        var sql = "CREATE TABLE changes ("
                + "id INT PRIMARY KEY, "
                + "entity_id INT REFERENCES entities (id) NOT NULL, "
                + "commit_id INT REFERENCES commits (id) NOT NULL, "
                + "churn INT NOT NULL, "
                + "UNIQUE (commit_id, entity_id)"
                + ")";

        return con.createQuery(sql, false);
    }

    @Override
    public Query prepareInsert(Connection con)
    {
        var sql = "INSERT INTO changes (id, entity_id, commit_id, churn) "
                + "VALUES (:id, :entity_id, :commit_id, :churn)";

        return con.createQuery(sql, false);
    }

    @Override
    public void addToBatch(Query query, Change<TreeTag> change)
    {
        if (this.ids.contains(change))
        {
            return;
        }

        var entityId = this.entityIds.get(change.getTag());
        var commitId = this.commitIds.get(change.getRev());

        if (entityId == null)
        {
            throw new RuntimeException("`change.getTag()`must already be inserted");
        }

        if (commitId == null)
        {
            throw new RuntimeException("`change.getRev()`must already be inserted");
        }

        query
            .addParameter("id", this.ids.assign(change))
            .addParameter("entity_id", entityId)
            .addParameter("commit_id", commitId)
            .addParameter("churn", change.getChurn())
            .addToBatch();
    }
}
