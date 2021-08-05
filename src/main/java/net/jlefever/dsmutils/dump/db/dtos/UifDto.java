package net.jlefever.dsmutils.dump.db.dtos;

import java.sql.Array;
import java.util.List;

import net.jlefever.dsmutils.SqlArrayUtils;

public class UifDto
{
    private final int num;
    private final String tgt;
    private final int fanin;
    private final int evoFanin;
    private final int size;
    private final Array indepIds;
    private final Array evoIndepIds;
    private final Array commitIds;
    private final Array changeIds;

    public UifDto(int num, String tgt, int fanin, int evoFanin, int size, Array indepIds, Array evoIndepIds,
            Array commitIds, Array changeIds)
    {
        this.num = num;
        this.tgt = tgt;
        this.fanin = fanin;
        this.evoFanin = evoFanin;
        this.size = size;
        this.indepIds = indepIds;
        this.evoIndepIds = evoIndepIds;
        this.commitIds = commitIds;
        this.changeIds = changeIds;
    }

    public int getNum()
    {
        return num;
    }

    public String getTgt()
    {
        return tgt;
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
