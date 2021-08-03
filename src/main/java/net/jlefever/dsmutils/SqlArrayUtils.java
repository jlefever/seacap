package net.jlefever.dsmutils;

import java.sql.Array;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

public class SqlArrayUtils
{
    public static <T> T[] toArray(Array array)
    {
        try
        {
            return (T[]) array.getArray();
        }
        catch (SQLException e)
        {
            throw new RuntimeException(e);
        }
    }

    public static <T> List<T> toList(Array array)
    {
        return Arrays.asList(SqlArrayUtils.toArray(array));
    }
}
