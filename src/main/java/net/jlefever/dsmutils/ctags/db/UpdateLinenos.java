package net.jlefever.dsmutils.ctags.db;

import java.util.Collection;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.ctags.TreeTag;
import net.jlefever.dsmutils.ir.EntityHasher;

public class UpdateLinenos
{
    private final Sql2o db;
    private final EntityHasher hasher;

    public UpdateLinenos(Sql2o db, EntityHasher hasher)
    {
        this.db = db;
        this.hasher = hasher;
    }

    public void call(Collection<? extends TreeTag> tags)
    {
        var sql = "UPDATE entities E SET linenos = (:start, :end) "
                + "FROM entity_digests ED "
                + "WHERE ED.entity_id = E.id AND ED.digest = :hash";

        try (var con = this.db.open())
        {
            for (var tag : tags)
            {
                var hash = this.hasher.hash(tag);

                con.createQuery(sql)
                    .addParameter("hash", hash.asBytes())
                    .addParameter("start", tag.getLine())
                    .addParameter("end", tag.getEnd())
                    .executeUpdate();
            }
        }
    }
}
