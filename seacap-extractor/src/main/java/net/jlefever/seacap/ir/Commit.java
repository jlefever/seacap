package net.jlefever.seacap.ir;

import org.eclipse.jgit.revwalk.RevCommit;

public class Commit
{
    private final String hash;
    private final String message;
    private final long commitTime;
    // private final long authorTime;

    public Commit(String hash, String message, long commitTime)
    {
        this.hash = hash;
        this.message = message;
        this.commitTime = commitTime;
    }

    public static Commit fromRevCommit(RevCommit r)
    {
        return new Commit(r.getId().getName(), r.getFullMessage(), r.getCommitTime());
    }

    public String getHash()
    {
        return hash;
    }

    public String getMessage()
    {
        return message;
    }

    public long getCommitTime()
    {
        return this.commitTime;
    }
}
