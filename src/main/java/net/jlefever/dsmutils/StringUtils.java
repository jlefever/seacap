package net.jlefever.dsmutils;

import java.util.Collection;
import java.util.stream.Collectors;

public class StringUtils
{
    public static <T> String join(String delimiter, Collection<? extends T> arr)
    {
        return arr.stream().map(Object::toString).collect(Collectors.joining(","));
    }
}
