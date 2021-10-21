package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

public class CreateCommitTableTask implements Task
{
    @Override
    public Query prepare(Connection con)
    {
        var sql = "CREATE TABLE commits ("
                + "id INT PRIMARY KEY, "
                + "sha1 CHAR(40) NOT NULL UNIQUE, "
                + "msg TEXT NOT NULL, "
                + "commit_time INT NOT NULL "
                + ")";

        return con.createQuery(sql, false);
    }
}
