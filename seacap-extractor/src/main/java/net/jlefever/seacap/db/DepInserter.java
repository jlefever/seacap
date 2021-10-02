package net.jlefever.seacap.db;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Map.Entry;

import org.sql2o.Connection;
import org.sql2o.Query;

import net.jlefever.seacap.ctags.TreeTag;
import net.jlefever.seacap.depends.Dep;
import net.jlefever.seacap.ir.Entity;

public class DepInserter implements Inserter<Entry<Dep, Integer>>
{
    private class LowResEntity implements Entity
    {
        private final Entity inner;

        public LowResEntity(Entity inner)
        {
            this.inner = inner;
        }

        @Override
        public boolean hasParent()
        {
            return this.inner.hasParent();
        }

        public LowResEntity getParent()
        {
            if (this.inner.getParent() == null)
            {
                return null;
            }

            return new LowResEntity(this.inner.getParent());
        }

        public String getName()
        {
            return this.inner.getName();
        }

        public String getKind()
        {
            var kind = this.inner.getKind();

            if (kind.equals("file"))
            {
                return "file";
            }
    
            if (kind.equals("annotation") ||
                kind.equals("class") ||
                kind.equals("enum") ||
                kind.equals("interface"))
            {
                return "type";
            }
    
            if (kind.equals("method"))
            {
                return "function";
            }
    
            if (kind.equals("enumConstant") ||
                kind.equals("field"))
            {
                return "var";
            }
    
            throw new IllegalArgumentException("Unrecognized kind `" + kind + "`");
        }

        @Override
        public boolean equals(Object obj)
        {
            return Objects.hashCode(this) == Objects.hashCode(obj);
        }

        @Override
        public int hashCode()
        {
            return Objects.hash(getParent(), getName(), getKind());
        }
    }

    private final IdMap<Dep> ids = new IdMapImpl<Dep>();
    private final Map<Entity, Integer> lowResEntityIds;

    public DepInserter(IdMap<TreeTag> entityIds, Collection<TreeTag> tags)
    {
        var lowResEntityIds = new HashMap<Entity, Integer>();

        for (var tag : tags)
        {
            var id = entityIds.get(tag);

            if (id == null)
            {
                throw new RuntimeException();
            }

            lowResEntityIds.put(new LowResEntity(tag), id);
        }

        this.lowResEntityIds = lowResEntityIds;
    }

    @Override
    public Query prepareCreateTable(Connection con)
    {
        var sql = "CREATE TABLE deps ("
                + "id INT PRIMARY KEY, "
                + "source_id INT REFERENCES entities (id) NOT NULL, "
                + "target_id INT REFERENCES entities (id) NOT NULL, "
                + "kind TEXT NOT NULL, "
                + "weight INT NOT NULL, "
                + "UNIQUE (source_id, target_id, kind), "
                + "CHECK (weight > 0) "
                + ")";

        return con.createQuery(sql, false);
    }

    @Override
    public Query prepareInsert(Connection con)
    {
        var sql = "INSERT INTO deps (id, source_id, target_id, kind, weight) "
                + "VALUES (:id, :source_id, :target_id, :kind, :weight)";

        return con.createQuery(sql, false);
    }

    @Override
    public void addToBatch(Query query, Entry<Dep, Integer> depEntry)
    {
        var dep = depEntry.getKey();

        if (this.ids.contains(dep))
        {
            System.out.println("warning: skipping (dep already inserted)");
            return;
        }

        var id = this.ids.assign(dep);
        var sourceId = this.lowResEntityIds.get(dep.getSource());
        var targetId = this.lowResEntityIds.get(dep.getTarget());

        if (sourceId == null)
        {
            System.out.println("warning: skipping (sourceId is null)");
            return;
            // throw new RuntimeException();
        }

        if (targetId == null)
        {
            System.out.println("warning: skipping (targetId is null)");
            return;
            // throw new RuntimeException();
        }

        query
            .addParameter("id", id)
            .addParameter("source_id", sourceId)
            .addParameter("target_id", targetId)
            .addParameter("kind", dep.getKind())
            .addParameter("weight", depEntry.getValue())
            .addToBatch();
    }
}
