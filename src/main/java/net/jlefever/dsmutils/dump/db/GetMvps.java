package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.dump.db.dtos.MvpDto;
import net.jlefever.dsmutils.dump.models.antipatterns.Mvp;
import net.jlefever.dsmutils.dump.models.antipatterns.MvpSummary;

public class GetMvps
{
    private final Sql2o db;

    public GetMvps(Sql2o db)
    {
        this.db = db;
    }

    public List<Mvp> call(int repoId)
    {
        var sql = "SELECT num, x, y, cochange, commit_ids AS commitIds, change_ids AS changeIds "
                + "FROM mvps WHERE repo_id = :repo_id";

        List<MvpDto> dtos;

        try (var con = this.db.open())
        {
            dtos = con.createQuery(sql).addParameter("repo_id", repoId).executeAndFetch(MvpDto.class);
        }

        var mvps = new ArrayList<Mvp>();

        for (var dto : dtos)
        {
            var mvp = new Mvp(new MvpSummary(dto.getNum(), dto.getX(), dto.getY(), dto.getCochange()));
            var changes = new GetChangesByIds(this.db).call(dto.getChangeIds());
            mvp.setChanges(changes);

            List<Integer> entityIds = changes.stream().map(c -> c.getEntityId()).collect(Collectors.toList());
            mvp.setEntities(new GetEntitiesByIds(db).call(entityIds));

            mvps.add(mvp);
        }

        return mvps;
    }
}
