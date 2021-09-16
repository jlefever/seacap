package net.jlefever.seacap.churn.db;

import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.seacap.churn.Change;
import net.jlefever.seacap.ir.Entity;
import net.jlefever.seacap.ir.EntityHasher;

public class StoreChanges
{
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
                + "WHERE ED.digest = :hash AND CM.sha1 = :rev "
                + "RETURNING id";

        try (var con = this.db.open())
        {
            for (var change : changes)
            {
                var res = con.createQuery(sql)
                    .addParameter("hash", this.hasher.hash(change.getTag()))
                    .addParameter("rev", change.getRev())
                    .addParameter("churn", change.getChurn())
                    .executeAndFetch(Integer.class);
            
                if (res.isEmpty())
                {
                    System.out.println("Warning: Failed to insert change");
                }

                if (res.size() > 1)
                {
                    throw new RuntimeException();
                }
            }
        }
    }
}