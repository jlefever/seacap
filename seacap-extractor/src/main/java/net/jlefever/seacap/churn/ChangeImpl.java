package net.jlefever.seacap.churn;

import java.util.Objects;

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

    @Override
    public boolean equals(Object obj)
    {
        return Objects.hashCode(this) == Objects.hashCode(obj);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(getTag(), getRev(), getChurn());
    }
}
