package net.jlefever.dsmutils.dump.models.antipatterns;

public class UifSummary
{
    private final int num;
    private final String tgt;
    private final int fanin;
    private final int evoFanin;
    private final int size;

    public UifSummary(int num, String tgt, int fanin, int evoFanin, int size)
    {
        this.num = num;
        this.tgt = tgt;
        this.fanin = fanin;
        this.evoFanin = evoFanin;
        this.size = size;
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
}
