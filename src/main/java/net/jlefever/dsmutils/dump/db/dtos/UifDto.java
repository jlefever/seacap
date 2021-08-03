package net.jlefever.dsmutils.dump.db.dtos;

import java.sql.Array;
import java.util.List;

import net.jlefever.dsmutils.SqlArrayUtils;

public class UifDto
{
    private final int num;
    private final String src;
    private final int fanout;
    private final int evoFanout;
    private final int size;
    private final Array outdepIds;
    private final Array evoOutdepIds;
    private final Array commitIds;
    private final Array changeIds;

    public UifDto(int num, String src, int fanout, int evoFanout, int size, Array outdepIds, Array evoOutdepIds,
            Array commitIds, Array changeIds)
    {
        this.num = num;
        this.src = src;
        this.fanout = fanout;
        this.evoFanout = evoFanout;
        this.size = size;
        this.outdepIds = outdepIds;
        this.evoOutdepIds = evoOutdepIds;
        this.commitIds = commitIds;
        this.changeIds = changeIds;
    }

    public int getNum()
    {
        return num;
    }

    public String getSrc()
    {
        return src;
    }

    public int getFanout()
    {
        return fanout;
    }

    public int getEvoFanout()
    {
        return evoFanout;
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

    public List<Integer> getCommitIds()
    {
        return SqlArrayUtils.toList(commitIds);
    }

    public List<Integer> getChangeIds()
    {
        return SqlArrayUtils.toList(changeIds);
    }
}
