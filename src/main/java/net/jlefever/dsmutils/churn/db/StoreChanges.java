package net.jlefever.dsmutils.churn.db;

import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.churn.Change;
import net.jlefever.dsmutils.ir.Entity;
import net.jlefever.dsmutils.ir.EntityHasher;

public class StoreChanges {
    private final Sql2o db;
    private final EntityHasher hasher;

    public StoreChanges(Sql2o db, EntityHasher hasher)
    {
        this.db = db;
        this.hasher = hasher;
    }

    public void call(List<? extends Change<? extends Entity>> changes)
    {
        var sql = "INSERT INTO changes (entity_id, commit_id, churn) "
                + "SELECT ED.entity_id, CM.id AS commit_id, :churn AS churn "
                + "FROM entity_digests ED, commits CM "
                + "WHERE ED.digest = :hash AND CM.sha1 = :rev";

        try (var con = this.db.open())
        {
            for (var change : changes)
            {
                var hash = this.hasher.hash(change.getTag());

                con.createQuery(sql)
                    .addParameter("hash", hash.asBytes())
                    .addParameter("rev", change.getRev())
                    .addParameter("churn", change.getChurn())
                    .executeUpdate();
            }
        }
    }
}
