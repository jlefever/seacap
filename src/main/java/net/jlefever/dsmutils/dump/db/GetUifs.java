package net.jlefever.dsmutils.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.dsmutils.dump.db.dtos.UifDto;
import net.jlefever.dsmutils.dump.models.antipatterns.Uif;
import net.jlefever.dsmutils.dump.models.antipatterns.UifSummary;

public class GetUifs
{
    private final Sql2o db;

    public GetUifs(Sql2o db)
    {
        this.db = db;
    }

    public List<Uif> call(int repoId)
    {
        var sql = "SELECT num, src, fanout, evo_fanout AS evoFanout, size, "
                + "outdep_ids AS outdepIds, evo_outdep_ids AS evoOutdepIds, "
                + "commit_ids AS commitIds, change_ids AS changeIds "
                + "FROM uifs WHERE repo_id = :repo_id";

        List<UifDto> dtos;

        try (var con = this.db.open())
        {
            dtos = con.createQuery(sql).addParameter("repo_id", repoId).executeAndFetch(UifDto.class);
        }

        var uifs = new ArrayList<Uif>();

        for (var dto : dtos)
        {
            var uif = new Uif(new UifSummary(dto.getNum(), dto.getSrc(), dto.getFanout(), dto.getEvoFanout(), dto.getSize()));

            uif.setChanges(new GetChanges(this.db).call(dto.getChangeIds()));

            uif.setEvoOutDeps(new GetDeps(db).call(dto.getEvoOutdepIds()));
            uif.setOutDeps(new GetDeps(db).call(dto.getOutdepIds()));

            var depIds = new ArrayList<Integer>();
            depIds.addAll(dto.getOutdepIds());
            depIds.addAll(dto.getEvoOutdepIds());
            uif.setEntities(new GetEntitiesOfDeps(db).call(depIds));

            uifs.add(uif);
        }

        return uifs;
    }
}
