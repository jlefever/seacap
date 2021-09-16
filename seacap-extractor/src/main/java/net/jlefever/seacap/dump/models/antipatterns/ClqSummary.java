package net.jlefever.seacap.dump.models.antipatterns;

import java.util.List;

public class ClqSummary
{
    private final int num;
    private final List<String> members;
    private final List<List<Integer>> subCliques;

    public ClqSummary(int num, List<String> members, List<List<Integer>> subCliques)
    {
        this.num = num;
        this.members = members;
        this.subCliques = subCliques;
    }

    public int getNum()
    {
        return this.num;
    }

    public List<String> getMembers()
    {
        return this.members;
    }

    public List<List<Integer>> getSubCliques()
    {
        return this.subCliques;
    }
}
