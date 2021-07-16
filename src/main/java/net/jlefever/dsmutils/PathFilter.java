package net.jlefever.dsmutils;

import java.util.ArrayList;
import java.util.Collection;
import static java.util.stream.Collectors.toList;
import static java.util.Collections.unmodifiableCollection;

public class PathFilter {
    private final Collection<String> whitelist;
    private final Collection<String> blacklist;

    public PathFilter(Collection<String> whitelist, Collection<String> blacklist)
    {
        this.whitelist = whitelist;
        this.blacklist = blacklist;
    }

    public Collection<String> toArgs()
    {
        var patterns = new ArrayList<String>();
        patterns.addAll(getWhitelist());
        patterns.addAll(getBlacklist().stream().map(p -> ":^" + p).collect(toList()));
        return patterns;
    }

    public Collection<String> getWhitelist()
    {
        return unmodifiableCollection(this.whitelist);
    }

    public Collection<String> getBlacklist()
    {
        return unmodifiableCollection(this.blacklist);
    }
}
