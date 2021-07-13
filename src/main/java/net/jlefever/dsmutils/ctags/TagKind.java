package net.jlefever.dsmutils.ctags;

public class TagKind {
    private final char letter;
    private final String name;
    private final String detail;

    public TagKind(char letter, String name, String detail)
    {
        this.letter = letter;
        this.name = name;
        this.detail = detail;
    }

    public char getLetter()
    {
        return letter;
    }

    public String getName()
    {
        return name;
    }

    public String getDetail()
    {
        return detail;
    }
    
}
