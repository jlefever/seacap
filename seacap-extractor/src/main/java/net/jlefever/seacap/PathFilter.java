package net.jlefever.seacap;

import java.util.ArrayList;
import java.util.Collection;
import static java.util.stream.Collectors.toList;
import static java.util.Collections.unmodifiableCollection;

public class PathFilter {
    private final Collection<String> allowed;
    private final Collection<String> ignored;

    public PathFilter(Collection<String> allowed, Collection<String> ignored)
    {
        this.allowed = allowed;
        this.ignored = ignored;
    }

    public Collection<String> toArgs()
    {
        // https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefpathspecapathspec
        var patterns = new ArrayList<String>();
        patterns.addAll(getAllowed().stream().map(p -> ":(glob)" + p).collect(toList()));
        patterns.addAll(getIgnored().stream().map(p -> ":(glob,exclude)" + p).collect(toList()));
        return patterns;
    }

    public Collection<String> getAllowed()
    {
        return unmodifiableCollection(this.allowed);
    }

    public Collection<String> getIgnored()
    {
        return unmodifiableCollection(this.ignored);
    }
}
