package net.jlefever.seacap.ctags;

import java.util.Objects;

public class ChangeImpl<T, R> implements Change<T, R>
{
    private final T tag;
    private final R rev;
    private final ChangeKind kind;

    public ChangeImpl(T tag, R rev, ChangeKind kind)
    {
        this.tag = tag;
        this.rev = rev;
        this.kind = kind;
    }

    public T getTag()
    {
        return this.tag;
    }

    public R getRev()
    {
        return rev;
    }

    public ChangeKind getKind()
    {
        return kind;
    }

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getTag(), getRev(), getKind());
    }
}
