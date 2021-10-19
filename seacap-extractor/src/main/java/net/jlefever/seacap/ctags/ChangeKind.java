package net.jlefever.seacap.ctags;

public enum ChangeKind
{
    ADDED('A'), DELETED('D'), MODIFIED('M');

    private final char name;

    private ChangeKind(char name)
    {
        this.name = name;
    }

    public char getName()
    {
        return this.name;
    }
}
