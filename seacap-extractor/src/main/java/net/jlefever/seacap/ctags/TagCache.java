package net.jlefever.seacap.ctags;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class TagCache
{
    private final CTagsDriver driver;
    private final Map<Object, TreeTag> cache = new HashMap<Object, TreeTag>();
    private final AtomicInteger numCacheHits = new AtomicInteger();
    private final AtomicInteger numCacheMisses = new AtomicInteger();

    public TagCache(CTagsDriver driver)
    {
        this.driver = driver;
    }

    public TreeTag get(Object cacheKey, String filename, byte[] content) throws IOException
    {
        var tag = this.cache.get(cacheKey);

        if (tag == null)
        {
            this.numCacheMisses.incrementAndGet();
            tag = this.driver.generateTags(filename, content);
            this.cache.put(cacheKey, tag);
        }
        else
        {
            this.numCacheHits.incrementAndGet();
        }

        return tag;
    }

    public int getNumCacheHits()
    {
        return this.numCacheHits.get();
    }

    public int getNumCacheMisses()
    {
        return numCacheMisses.get();
    }
}
