package net.jlefever.seacap.dump.models.antipatterns;

import java.util.List;

import net.jlefever.seacap.dump.models.Change;
import net.jlefever.seacap.dump.models.Entity;

public interface AntiPattern {
    List<Entity> getEntities();
    List<Change> getChanges();
}
