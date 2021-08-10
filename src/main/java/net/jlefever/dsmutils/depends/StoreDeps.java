package net.jlefever.dsmutils.depends;

import java.util.Map;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.ir.EntityHasher;

public class StoreDeps
{
    private final Sql2o db;
    private final EntityHasher hasher;

    public StoreDeps(Sql2o db, EntityHasher hasher)
    {
        this.db = db;
        this.hasher = hasher;
    }

    public void call(Map<Dep, Integer> deps)
    {
        var sql = "INSERT INTO deps (source_id, target_id, kind, weight) "
                + "SELECT SED.entity_id, TED.entity_id, :kind, :weight "
                + "FROM entity_alt_digests SED CROSS JOIN entity_alt_digests TED "
                + "INNER JOIN entities SE ON SE.id = SED.entity_id "
                + "INNER JOIN entities TE ON TE.id = TED.entity_id "
                + "WHERE SED.digest = :source_hash AND TED.digest = :target_hash "
                + "AND SE.linenos IS NOT NULL AND TE.linenos IS NOT NULL "
                + "RETURNING id";

        try (var con = this.db.open())
        {
            for (var pair : deps.entrySet())
            {
                var dep = pair.getKey();
                var weight = pair.getValue();

                var res = con.createQuery(sql)
                    .addParameter("source_hash", this.hasher.hash(dep.getSource()))
                    .addParameter("target_hash", this.hasher.hash(dep.getTarget()))
                    .addParameter("kind", dep.getKind()).addParameter("weight", weight)
                    .executeAndFetch(Integer.class);

                // Only report a problem if its an external dependency
                if (res.isEmpty() && !dep.getSource().getPath().equals(dep.getTarget().getPath()))
                {
                    System.out.println("Warning: Failed to insert " + dep);
                }

                if (res.size() > 1)
                {
                    throw new RuntimeException();
                }
            }
        }
    }
}
