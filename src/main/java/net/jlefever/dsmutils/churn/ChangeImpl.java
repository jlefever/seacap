package net.jlefever.dsmutils.churn;

public class ChangeImpl<T> implements Change<T> {
    private final T tag;
    private final String rev;
    private final int churn;

    public ChangeImpl(T tag, String rev, int churn)
    {
        this.tag = tag;
        this.rev = rev;
        this.churn = churn;
    }

    public T getTag()
    {
        return this.tag;
    }

    public String getRev()
    {
        return rev;
    }

    public int getChurn()
    {
        return churn;
    }
}
