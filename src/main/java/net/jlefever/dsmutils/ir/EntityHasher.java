package net.jlefever.dsmutils.ir;

import com.google.common.hash.HashCode;

public interface EntityHasher {
    HashCode hash(Entity entity);
}
