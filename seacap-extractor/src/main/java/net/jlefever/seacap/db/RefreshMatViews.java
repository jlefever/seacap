package net.jlefever.seacap.db;

import org.sql2o.Sql2o;

public class RefreshMatViews
{
    private final Sql2o db;

    public RefreshMatViews(Sql2o db)
    {
        this.db = db;
    }

    public void call()
    {
        try (var con = this.db.open())
        {
            con.createQuery("CALL refresh_mat_views()").executeUpdate();
        }
    }
}
