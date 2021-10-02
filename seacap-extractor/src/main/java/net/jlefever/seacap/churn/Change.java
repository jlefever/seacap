package net.jlefever.seacap.churn;

public interface Change<T>
{
    T getTag();
    String getRev();
    int getChurn();
}
