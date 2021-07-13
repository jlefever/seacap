package net.jlefever.dsmutils.db;

import java.util.HashMap;
import java.util.Map;

import org.sql2o.Connection;

public class DbCommandCache {
    private final Map<DbCommand, Object> cache;

    public DbCommandCache()
    {
        this.cache = new HashMap<DbCommand, Object>();
    }

    public <T> T get(DbCommand<T> command, Connection con)
    {
        if (this.cache.containsKey(command))
        {
            return (T) this.cache.get(command);
        }

        var result = command.execute(con);
        this.cache.put(command, result);
        return result;
    }
}
