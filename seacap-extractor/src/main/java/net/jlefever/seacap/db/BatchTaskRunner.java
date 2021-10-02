package net.jlefever.seacap.db;

import java.util.Collection;

import org.sql2o.Connection;
import org.sql2o.Sql2o;

public class BatchTaskRunner
{
    private Sql2o db;

    public BatchTaskRunner(Sql2o db)
    {
        this.db = db;
    }

    public <T> void run(BatchTask<T> task, Collection<? extends T> items)
    {
        try (Connection con = this.db.beginTransaction())
        {
            var query = task.prepare(con);

            for (var item : items)
            {
                task.add(query, item);
            }

            query.executeBatch();
            con.commit();
        }
    }
}
