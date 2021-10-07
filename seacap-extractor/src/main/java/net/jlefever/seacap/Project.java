package net.jlefever.seacap;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;

import org.yaml.snakeyaml.TypeDescription;
import org.yaml.snakeyaml.Yaml;

public class Project
{
    private String displayName;
    private String description;
    private String git;
    private String gitWeb;
    private String gitLeadRef;
    private Integer gitMaxCommits;
    private List<String> allowedPaths;
    private List<String> ignoredPaths;

    public Project() { }

    public String getDisplayName()
    {
        return displayName;
    }

    public void setDisplayName(String displayName)
    {
        this.displayName = displayName;
    }

    public String getDescription()
    {
        return description;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public String getGit()
    {
        return git;
    }

    public void setGit(String git)
    {
        this.git = git;
    }

    public String getGitWeb()
    {
        return gitWeb;
    }

    public void setGitWeb(String gitWeb)
    {
        this.gitWeb = gitWeb;
    }

    public String getGitLeadRef()
    {
        return gitLeadRef;
    }

    public void setGitLeadRef(String gitLeadRef)
    {
        this.gitLeadRef = gitLeadRef;
    }

    public int getGitMaxCommits()
    {
        if (gitMaxCommits == null)
        {
            return -1;
        }

        return gitMaxCommits;
    }

    public void setGitMaxCommits(Integer gitMaxCommits)
    {
        this.gitMaxCommits = gitMaxCommits;
    }

    public List<String> getAllowedPaths()
    {
        if (allowedPaths == null)
        {
            return Collections.emptyList();
        }

        return allowedPaths;
    }

    public void setAllowedPaths(List<String> allowedPaths)
    {
        this.allowedPaths = allowedPaths;
    }

    public List<String> getIgnoredPaths()
    {
        if (ignoredPaths == null)
        {
            return Collections.emptyList();
        }

        return ignoredPaths;
    }

    public void setIgnoredPaths(List<String> ignoredPaths)
    {
        this.ignoredPaths = ignoredPaths;
    }

    public PathFilter getPathFilter()
    {
        return new PathFilter(this.getAllowedPaths(), this.getIgnoredPaths());
    }

    public static Project loadFromYaml(InputStream stream)
    {
        var desc = new TypeDescription(Project.class);
        desc.substituteProperty("display_name", String.class, "getDisplayName", "setDisplayName");
        desc.substituteProperty("git_web", String.class, "getGitWeb", "setGitWeb");
        desc.substituteProperty("git_lead_ref", String.class, "getGitLeadRef", "setGitLeadRef");
        desc.substituteProperty("git_max_commits", Integer.class, "getGitMaxCommits", "setGitMaxCommits");
        desc.substituteProperty("allowed_paths", List.class, "getAllowedPaths", "setAllowedPaths");
        desc.substituteProperty("ignored_paths", List.class, "getIgnoredPaths", "setIgnoredPaths");

        var yaml = new Yaml();
        yaml.addTypeDescription(desc);
        return yaml.loadAs(stream, Project.class);
    }
}
