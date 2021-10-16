package net.jlefever.seacap;

import java.util.Collection;
import static java.util.stream.Collectors.toList;

import java.nio.file.FileSystems;
import java.nio.file.PathMatcher;
import java.nio.file.Paths;

public class PathFilter
{
    private final Collection<PathMatcher> allowedMatchers;
    private final Collection<PathMatcher> ignoredMatchers;

    public PathFilter(Collection<String> allowed, Collection<String> ignored)
    {
        // TODO: Does this work the same on Windows? (Paths in git are unix-like.)
        var fs = FileSystems.getDefault();
        this.allowedMatchers = allowed.stream().map(p -> fs.getPathMatcher("glob:" + p)).collect(toList());
        this.ignoredMatchers = ignored.stream().map(p -> fs.getPathMatcher("glob:" + p)).collect(toList());
    }

    public boolean allowed(String path)
    {
        // TODO: Does this work the same on Windows? (Paths in git are unix-like.)
        var p = Paths.get(path);

        // If this path matches any ignored patterns, return false.
        for (var matcher : this.ignoredMatchers)
        {
            if (matcher.matches(p)) return false;
        }

        // If there are no allow patterns, default to returning true.
        if (this.allowedMatchers.isEmpty()) return true;

        // Otherwise, check if this path matches any allow patterns.
        for (var matcher : this.allowedMatchers)
        {
            if (matcher.matches(p)) return true;
        }

        // No allow patterns were matched so return false.
        return false;
    }
}
