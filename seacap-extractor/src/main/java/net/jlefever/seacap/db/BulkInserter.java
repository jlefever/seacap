package net.jlefever.seacap.db;

import java.util.Collection;

import org.sql2o.Connection;
import org.sql2o.Sql2o;

public class BulkInserter<T>
{
    private Sql2o db;
    private final Inserter<T> inserter;

    public BulkInserter(Sql2o db, Inserter<T> inserter)
    {
        this.db = db;
        this.inserter = inserter;
    }

    public void insertAll(Collection<? extends T> items)
    {
        this.insertAll(items, true);
    }

    public void insertAll(Collection<? extends T> items, boolean createTable)
    {
        try (Connection con = this.db.beginTransaction())
        {
            if (createTable)
            {
                this.inserter.prepareCreateTable(con).executeUpdate();
            }

            var query = this.inserter.prepareInsert(con);

            for (var item : items)
            {
                this.inserter.addToBatch(query, item);
            }

            query.executeBatch();
            con.commit();
        }
    }
}
