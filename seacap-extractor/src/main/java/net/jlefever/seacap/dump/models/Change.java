package net.jlefever.seacap.dump.models;

public class Change
{
    private final int id;
    private final int entityId;
    private final String commitHash;
    private final int churn;

    public Change(int id, int entityId, String commitHash, int churn)
    {
        this.id = id;
        this.entityId = entityId;
        this.commitHash = commitHash;
        this.churn = churn;
    }

    public int getId()
    {
        return id;
    }

    public int getEntityId()
    {
        return entityId;
    }

    public String getCommitHash()
    {
        return commitHash;
    }

    public int getChurn()
    {
        return churn;
    }
}
