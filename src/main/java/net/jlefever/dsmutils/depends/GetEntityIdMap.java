package net.jlefever.dsmutils.depends;

import java.util.HashMap;
import java.util.Map;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;

import org.sql2o.Connection;

import net.jlefever.dsmutils.db.DbCommand;

public class GetEntityIdMap implements DbCommand<Map<? extends Entity, Integer>>
{
    private final int repoId;

    public GetEntityIdMap(int repoId)
    {
        this.repoId = repoId;
    }

    public int getRepoId()
    {
        return repoId;
    }

    @Override
    public Map<? extends Entity, Integer> execute(Connection con)
    {
        var sql = "SELECT T.id, T.parent_id AS parentId, T.name, K.name AS kind, P.name AS path "
                + "FROM tags T "
                + "LEFT JOIN paths P ON T.path_id = P.id "
                + "LEFT JOIN tag_kinds K ON T.kind_id = K.id "
                + "WHERE P.repo_id = :repo_id";

        var entities = con.createQuery(sql)
            .addParameter("repo_id", this.getRepoId())
            .executeAndFetch(StoredEntity.class);

        var ids = new HashMap<Integer, StoredEntity>();
        entities.forEach(e -> ids.put(e.getId(), e));

        for(var entity : entities)
        {
            if (!entity.hasParent())
            {
                continue;
            }

            var parent = ids.get(entity.getParentId());

            if (parent == null)
            {
                throw new RuntimeException();
            }

            entity.setParent(parent);
        }

        var reverseIds = new HashMap<StoredEntity, Integer>();
        ids.entrySet().forEach(pair -> reverseIds.put(pair.getValue(), pair.getKey()));
        return reverseIds;
    }
}
