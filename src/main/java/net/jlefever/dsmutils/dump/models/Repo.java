package net.jlefever.dsmutils.dump.models;

public class Repo {
    private final int id;
    private final String name;
    private final String githubUrl;
    private final String leadRef;

    public Repo(int id, String name, String githubUrl, String leadRef)
    {
        this.id = id;
        this.name = name;
        this.githubUrl = githubUrl;
        this.leadRef = leadRef;
    }

    public int getId()
    {
        return id;
    }

    public String getName()
    {
        return name;
    }

    public String getGithubUrl()
    {
        return githubUrl;
    }

    public String getLeadRef()
    {
        return leadRef;
    }
}
