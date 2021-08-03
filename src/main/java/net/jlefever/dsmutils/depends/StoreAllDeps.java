package net.jlefever.dsmutils.depends;

import java.util.List;
import java.util.Map;

import org.sql2o.Connection;

public class StoreAllDeps {
    private final Map<? extends Dep, Integer> deps;
    private final Map<? extends Entity, Integer> ids;
    private final List<String> paths;

    public StoreAllDeps(Map<? extends Dep, Integer> deps, Map<? extends Entity, Integer> ids, List<String> paths)
    {
        this.deps = deps;
        this.ids = ids;
        this.paths = paths;
    }

    public Void execute(Connection con)
    {
        var ids = this.getIds();

        var sql = "INSERT INTO deps (source_id, target_id, kind, weight)"
                + "VALUES (:source_id, :target_id, :kind, :weight)";
        
        var query = con.createQuery(sql);

        for (var pair : this.getDeps().entrySet())
        {
            var dep = pair.getKey();
            var weight = pair.getValue();

            if (!this.paths.contains(dep.getSource().getPath()) && !this.paths.contains(dep.getTarget().getPath()))
            {
                continue;
            }

            if (!ids.containsKey(dep.getSource()) || !ids.containsKey(dep.getTarget()))
            {
                System.out.println("Warning: Skipping " + dep.toString());
                continue;
            }

            query.addParameter("source_id", ids.get(dep.getSource()))
                 .addParameter("target_id", ids.get(dep.getTarget()))
                 .addParameter("kind", dep.getKind())
                 .addParameter("weight", weight)
                 .addToBatch();
        }

        query.executeBatch();
        // con.commit(false);
        return null;
    }

    public Map<? extends Dep, Integer> getDeps()
    {
        return deps;
    }
    
    public Map<? extends Entity, Integer> getIds()
    {
        return ids;
    }
}
