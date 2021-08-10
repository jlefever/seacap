package net.jlefever.dsmutils.dump.models.antipatterns;

public class CrsSummary
{
    private final int num;
    private final String center;
    private final int fanout;
    private final int evoFanout;
    private final int fanin;
    private final int evoFanin;
    private final int size;

    public CrsSummary(int num, String center, int fanout, int evoFanout, int fanin, int evoFanin, int size)
    {
        this.num = num;
        this.center = center;
        this.fanout = fanout;
        this.evoFanout = evoFanout;
        this.fanin = fanin;
        this.evoFanin = evoFanin;
        this.size = size;
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
}
