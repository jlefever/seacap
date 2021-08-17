package net.jlefever.dsmutils.dump.models.antipatterns;

import java.util.List;

import net.jlefever.dsmutils.dump.models.Change;
import net.jlefever.dsmutils.dump.models.Entity;

public interface AntiPattern {
    List<Entity> getEntities();
    List<Change> getChanges();
}
