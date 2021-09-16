package net.jlefever.seacap.dump.db;

import java.util.ArrayList;
import java.util.List;

import org.sql2o.Sql2o;

import net.jlefever.seacap.dump.db.dtos.CrsDto;
import net.jlefever.seacap.dump.models.antipatterns.Crs;
import net.jlefever.seacap.dump.models.antipatterns.CrsSummary;

public class GetCrss
{
    private final Sql2o db;

    public GetCrss(Sql2o db)
    {
        this.db = db;
    }

    public List<Crs> call(int repoId)
    {
        var sql = "SELECT num, center, fanout, evo_fanout AS evoFanout, fanin, evo_fanin AS evoFanin, size, "
                + "outdep_ids AS outdepIds, evo_outdep_ids AS evoOutdepIds, indep_ids AS indepIds, "
                + "evo_indep_ids AS evoIndepIds, commit_ids AS commitIds, change_ids AS changeIds "
                + "FROM crss WHERE repo_id = :repo_id";

        List<CrsDto> dtos;

        try (var con = this.db.open())
        {
            dtos = con.createQuery(sql).addParameter("repo_id", repoId).executeAndFetch(CrsDto.class);
        }

        var crss = new ArrayList<Crs>();

        for (var dto : dtos)
        {
            var crs = new Crs(new CrsSummary(dto.getNum(), dto.getCenter(), dto.getFanout(), dto.getEvoFanout(),
                    dto.getFanin(), dto.getEvoFanin(), dto.getSize()));

            crs.setChanges(new GetChangesByIds(this.db).call(dto.getChangeIds()));

            crs.setOutDeps(new GetDepsByIds(db).call(dto.getOutdepIds()));
            crs.setEvoOutDeps(new GetDepsByIds(db).call(dto.getEvoOutdepIds()));
            crs.setInDeps(new GetDepsByIds(db).call(dto.getIndepIds()));
            crs.setEvoInDeps(new GetDepsByIds(db).call(dto.getEvoIndepIds()));

            var depIds = new ArrayList<Integer>();
            depIds.addAll(dto.getOutdepIds());
            depIds.addAll(dto.getEvoOutdepIds());
            depIds.addAll(dto.getIndepIds());
            depIds.addAll(dto.getEvoIndepIds());
            crs.setEntities(new GetEntitiesOfDeps(db).call(depIds));

            crss.add(crs);
        }

        return crss;
    }
}
