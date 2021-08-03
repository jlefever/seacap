package net.jlefever.dsmutils.churn;
public interface Change<T>
{
    T getTag();
    String getRev();
    int getChurn();
}
