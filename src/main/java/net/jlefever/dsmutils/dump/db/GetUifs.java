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
        var sql = "SELECT num, tgt, fanin, evo_fanin AS evoFanin, size, "
                + "indep_ids AS indepIds, evo_indep_ids AS evoIndepIds, "
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
            var uif = new Uif(new UifSummary(dto.getNum(), dto.getTgt(), dto.getFanin(), dto.getEvoFanin(), dto.getSize()));

            uif.setChanges(new GetChangesByIds(this.db).call(dto.getChangeIds()));

            uif.setEvoInDeps(new GetDepsByIds(db).call(dto.getEvoIndepIds()));
            uif.setInDeps(new GetDepsByIds(db).call(dto.getIndepIds()));

            var depIds = new ArrayList<Integer>();
            depIds.addAll(dto.getIndepIds());
            depIds.addAll(dto.getEvoIndepIds());
            uif.setEntities(new GetEntitiesOfDeps(db).call(depIds));

            uifs.add(uif);
        }

        return uifs;
    }
}
