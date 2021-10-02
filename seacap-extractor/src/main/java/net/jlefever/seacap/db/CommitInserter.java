package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public class CommitInserter implements Inserter<String>
{
    private final IdMap<String> ids;

    public CommitInserter(IdMap<String> ids)
    {
        this.ids = ids;
    }

    @Override
    public Query prepareCreateTable(Connection con)
    {
        var sql = "CREATE TABLE commits ("
                + "id INT PRIMARY KEY, "
                + "sha1 CHAR(40) NOT NULL UNIQUE "
                + ")";

        return con.createQuery(sql, false);
    }

    @Override
    public Query prepareInsert(Connection con)
    {
        var sql = "INSERT INTO commits (id, sha1) VALUES (:id, :sha1)";
        return con.createQuery(sql, false);
    }

    @Override
    public void addToBatch(Query query, String sha1)
    {
        if (this.ids.contains(sha1))
        {
            return;
        }

        query
            .addParameter("id", this.ids.assign(sha1))
            .addParameter("sha1", sha1)
            .addToBatch();
    }
}
