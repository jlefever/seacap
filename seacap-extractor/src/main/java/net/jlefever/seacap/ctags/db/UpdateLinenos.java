package net.jlefever.seacap.ctags.db;

import java.util.Collection;

import org.sql2o.Sql2o;

import net.jlefever.seacap.ctags.TreeTag;
import net.jlefever.seacap.ir.EntityHasher;

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
                + "WHERE ED.entity_id = E.id AND ED.digest = :hash "
                + "RETURNING id";

        try (var con = this.db.open())
        {
            for (var tag : tags)
            {
                var res = con.createQuery(sql)
                    .addParameter("hash", this.hasher.hash(tag))
                    .addParameter("start", tag.getLine())
                    .addParameter("end", tag.getEnd())
                    .executeAndFetch(Integer.class);
                
                if (res.isEmpty())
                {
                    System.out.println("Warning: Failed to update entity with linenos");
                }

                if (res.size() > 1)
                {
                    throw new RuntimeException();
                }
            }
        }
    }
}
