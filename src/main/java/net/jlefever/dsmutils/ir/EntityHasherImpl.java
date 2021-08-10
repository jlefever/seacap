package net.jlefever.dsmutils.ir;

import com.google.common.base.Charsets;
import com.google.common.hash.HashCode;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

public class EntityHasherImpl implements EntityHasher
{
    private final HashFunction hashFn;

    public EntityHasherImpl()
    {
        this.hashFn = Hashing.sha256();
    }

    @Override
    public HashCode hash(Entity entity)
    {
        var hasher = this.hashFn.newHasher();

        if (entity.hasParent())
        {
            hasher.putBytes(this.hash(entity.getParent()).asBytes());
        }

        hasher.putString(entity.getName() + "," + entity.getKind(), Charsets.UTF_8);
        return hasher.hash();
    }
}
