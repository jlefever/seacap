package net.jlefever.dsmutils.depends;

import java.util.Map;

import org.sql2o.Connection;

import net.jlefever.dsmutils.db.DbCommand;

public class StoreAllDeps implements DbCommand<Void> {
    private final Map<? extends Dep, Integer> deps;
    private final Map<? extends Entity, Integer> ids;

    public StoreAllDeps(Map<? extends Dep, Integer> deps, Map<? extends Entity, Integer> ids)
    {
        this.deps = deps;
        this.ids = ids;
    }

    @Override
    public Void execute(Connection con)
    {
        var ids = this.getIds();

        var sql = "INSERT INTO deps (src_id, dst_id, kind, weight)"
                + "VALUES (:src_id, :dst_id, :kind, :weight)";
        
        var query = con.createQuery(sql);

        for (var pair : this.getDeps().entrySet())
        {
            var dep = pair.getKey();
            var weight = pair.getValue();

            if (!ids.containsKey(dep.getSrc()) || !ids.containsKey(dep.getDst()))
            {
                System.out.println("Warning: Skipping " + dep.toString());
                continue;
            }

            query.addParameter("src_id", ids.get(dep.getSrc()))
                 .addParameter("dst_id", ids.get(dep.getDst()))
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
