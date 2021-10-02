package net.jlefever.seacap.db;

import java.util.HashMap;
import java.util.Map;

/**
 * Not thread-safe.
 */
public class IdMapImpl<T> implements IdMap<T>
{
    private final Map<T, Integer> ids = new HashMap<T, Integer>();
    private int next = 0;

    @Override
    public boolean contains(T item)
    {
        return ids.containsKey(item);
    }

    @Override
    public Integer get(T item)
    {
        return ids.get(item);
    }

    @Override
    public int assign(T item)
    {
        var id = ids.get(item);

        if (id == null)
        {
            id = this.next;
            ids.put(item, id);
            this.next++;
        }
        
        return id;
    }

    public Map<T, Integer> getUnderlyingMap()
    {
        return this.ids;
    }
}
