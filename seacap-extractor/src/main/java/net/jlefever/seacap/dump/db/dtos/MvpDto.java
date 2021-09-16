package net.jlefever.seacap.dump.db.dtos;

import java.sql.Array;
import java.util.List;

import net.jlefever.seacap.SqlArrayUtils;

public class MvpDto
{
    private final int num;
    private final String x;
    private final String y;
    private final int cochange;
    private final Array commitIds;
    private final Array changeIds;

    public MvpDto(int num, String x, String y, int cochange, Array commitIds, Array changeIds)
    {
        this.num = num;
        this.x = x;
        this.y = y;
        this.cochange = cochange;
        this.commitIds = commitIds;
        this.changeIds = changeIds;
    }

    public int getNum()
    {
        return num;
    }

    public String getX()
    {
        return x;
    }
    
    public String getY()
    {
        return y;
    }

    public int getCochange()
    {
        return cochange;
    }

    public List<Integer> getCommitIds()
    {
        return SqlArrayUtils.toList(commitIds);
    }

    public List<Integer> getChangeIds()
    {
        return SqlArrayUtils.toList(changeIds);
    }
}
