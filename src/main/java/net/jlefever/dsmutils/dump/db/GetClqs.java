package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.clique.CliqueFinder;
import net.jlefever.dsmutils.clique.GraphImpl;
import net.jlefever.dsmutils.dump.models.DepEdge;
import net.jlefever.dsmutils.dump.models.antipatterns.Clq;
import net.jlefever.dsmutils.dump.models.antipatterns.ClqSummary;

public class GetClqs
{
    private static final List<String> DEP_KINDS = Arrays.asList("call", "use");

    private final Sql2o db;

    public GetClqs(Sql2o db)
    {
        this.db = db;
    }

    public List<Clq> call(int repoId)
    {
        var fileDeps = new GetFileDeps(db).call(repoId, DEP_KINDS);
        var cliques = new CliqueFinder<>(new GraphImpl<>(fileDeps)).find();

        var clqs = new ArrayList<Clq>();

        var num = 0;
        for (var clique : cliques)
        {
            num = num + 1;

            var deps = new GetDepsByFilenames(db).call(repoId, clique, DEP_KINDS);
            var depEdges = deps.stream().map(d -> new DepEdge(d)).collect(Collectors.toList());
            var subCliques = new CliqueFinder<>(new GraphImpl<>(depEdges)).find();

            var clq = new Clq(new ClqSummary(num, clique, subCliques));
            clq.setDeps(deps);

            var depIds = deps.stream().map(d -> d.getId()).collect(Collectors.toList());
            var entities = new GetEntitiesOfDeps(db).call(depIds);
            clq.setEntities(entities);

            var entityIds = entities.stream().map(e -> e.getId()).collect(Collectors.toList());
            clq.setChanges(new GetChangesForEntities(db).call(entityIds));

            clqs.add(clq);
        }

        return clqs;
    }
}
