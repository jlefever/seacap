package net.jlefever.seacap.dump.db.dtos;

import java.sql.Array;
import java.util.List;

import net.jlefever.seacap.SqlArrayUtils;

public class CrsDto
{
    private final int num;
    private final String center;
    private final int fanout;
    private final int evoFanout;
    private final int fanin;
    private final int evoFanin;
    private final int size;
    private final Array outdepIds;
    private final Array evoOutdepIds;
    private final Array indepIds;
    private final Array evoIndepIds;
    private final Array commitIds;
    private final Array changeIds;

    public CrsDto(int num, String center, int fanout, int evoFanout, int fanin, int evoFanin, int size, Array outdepIds,
            Array evoOutdepIds, Array indepIds, Array evoIndepIds, Array commitIds, Array changeIds)
    {
        this.num = num;
        this.center = center;
        this.fanout = fanout;
        this.evoFanout = evoFanout;
        this.fanin = fanin;
        this.evoFanin = evoFanin;
        this.size = size;
        this.outdepIds = outdepIds;
        this.evoOutdepIds = evoOutdepIds;
        this.indepIds = indepIds;
        this.evoIndepIds = evoIndepIds;
        this.commitIds = commitIds;
        this.changeIds = changeIds;
    }

    public int getNum()
    {
        return num;
    }

    public String getCenter()
    {
        return center;
    }

    public int getFanout()
    {
        return fanout;
    }

    public int getEvoFanout()
    {
        return evoFanout;
    }

    public int getFanin()
    {
        return fanin;
    }

    public int getEvoFanin()
    {
        return evoFanin;
    }

    public int getSize()
    {
        return size;
    }

    public List<Integer> getOutdepIds()
    {
        return SqlArrayUtils.toList(outdepIds);
    }

    public List<Integer> getEvoOutdepIds()
    {
        return SqlArrayUtils.toList(evoOutdepIds);
    }

    public List<Integer> getIndepIds()
    {
        return SqlArrayUtils.toList(indepIds);
    }

    public List<Integer> getEvoIndepIds()
    {
        return SqlArrayUtils.toList(evoIndepIds);
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