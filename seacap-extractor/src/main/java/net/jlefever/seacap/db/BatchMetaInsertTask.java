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
        add(query, "displayName", project.getDisplayName());
        add(query, "description", project.getDescription());
        add(query, "gitWeb", project.getGitWeb());
        add(query, "gitLeadRef", project.getGitLeadRef());
    }

    private void add(Query query, String key, String value)
    {
        query
            .addParameter("key", key)
            .addParameter("value", value)
            .addToBatch();
    }
}
