package net.jlefever.seacap.dump.models.antipatterns;

public class MvpSummary
{
    private final int num;
    private final String x;
    private final String y;
    private final int cochange;

    public MvpSummary(int num, String x, String y, int cochange)
    {
        this.num = num;
        this.x = x;
        this.y = y;
        this.cochange = cochange;
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
}
