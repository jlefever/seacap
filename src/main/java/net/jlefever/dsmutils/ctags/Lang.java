package net.jlefever.dsmutils.ctags;

import java.util.Collections;
import java.util.List;

public class Lang
{
    private final String name;
    private final List<TagKind> tagKinds;

    public Lang(String name, List<TagKind> tagKinds)
    {
        this.name = name;
        this.tagKinds = tagKinds;
    }

    public String getName()
    {
        return this.name;
    }

    public List<TagKind> getTagKinds()
    {
        return Collections.unmodifiableList(this.tagKinds);
    }
}
