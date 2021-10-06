package net.jlefever.seacap.db;

import org.sql2o.Connection;
import org.sql2o.Query;

import net.jlefever.seacap.Project;

public class BatchMetaInsertTask implements BatchTask<Project>
{
    public BatchMetaInsertTask()
    {
    }

    @Override
    public Query prepare(Connection con)
    {
        var sql = "INSERT INTO meta (key, value) VALUES (:key, :value)";
        return con.createQuery(sql, false);
    }

    @Override
    public void add(Query query, Project project)
    {
        add(query, "name", project.getName());
        add(query, "display_name", project.getDisplayName());
        add(query, "description", project.getDescription());
        add(query, "git", project.getGit());
        add(query, "git_web", project.getGitWeb());
        add(query, "git_lead_ref", project.getGitLeadRef());
    }

    private void add(Query query, String key, String value)
    {
        query
            .addParameter("key", key)
            .addParameter("value", value)
            .addToBatch();
    }
}
