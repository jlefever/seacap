package net.jlefever.seacap.ctags;

public interface Change<T, R>
{
    T getTag();

    R getRev();

    ChangeKind getKind();
}
