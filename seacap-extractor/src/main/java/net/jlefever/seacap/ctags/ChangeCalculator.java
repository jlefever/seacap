package net.jlefever.seacap.ctags;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.jgit.diff.ContentSource;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.diff.HistogramDiff;
import org.eclipse.jgit.errors.MissingObjectException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.util.io.DisabledOutputStream;

import net.jlefever.seacap.PathFilter;
import net.jlefever.seacap.ir.Commit;

public class ChangeCalculator implements AutoCloseable
{
    private final Repository repo;
    private final ObjectReader reader;
    private final ContentSource source;
    private final TagCache tagCache;
    private final PathFilter filter;

    public ChangeCalculator(Repository repo, TagCache tagCache, PathFilter filter)
    {
        this.repo = repo;
        this.reader = repo.newObjectReader();
        this.source = ContentSource.create(this.reader);
        this.tagCache = tagCache;
        this.filter = filter;
    }

    public List<Change<TreeTag, Commit>> calculateChanges(ObjectId branch) throws IOException
    {
        var changes = new ArrayList<Change<TreeTag, Commit>>();

        try (var walk = new RevWalk(this.reader); var formatter = new DiffFormatter(DisabledOutputStream.INSTANCE))
        {
            walk.markStart(walk.parseCommit(branch));
            formatter.setReader(this.reader, this.repo.getConfig());
            formatter.setDetectRenames(false);
            formatter.setDiffAlgorithm(new HistogramDiff());

            for (var commit : walk)
            {
                // Skip merge and initial commits
                if (commit.getParentCount() != 1) continue;

                var tree = commit.getTree();
                var parentTree = commit.getParents()[0].getTree();

                var changeProvider = new ChangeProvider<Commit>(Commit.fromRevCommit(commit));

                for (var diffEntry : formatter.scan(parentTree, tree))
                {
                    // We disabled renames so oldPath == newPath
                    if (!filter.allowed(diffEntry.getOldPath())) continue;

                    var oldId = diffEntry.getOldId().toObjectId();
                    var newId = diffEntry.getNewId().toObjectId();

                    var treeTagA = this.getTreeTag(oldId, diffEntry.getOldPath());
                    var treeTagB = this.getTreeTag(newId, diffEntry.getNewPath());

                    var editList = formatter.toFileHeader(diffEntry).toEditList();
                    changes.addAll(changeProvider.get(treeTagA, treeTagB, editList));
                }
            }
        }

        return changes;
    }

    public List<TreeTag> calculateCurrentEntities(ObjectId branch) throws IOException
    {
        RevTree tree = null;

        // Because we pass an ObjectReader and not a Repository, closing this resource does nothing.
        // We put it in a try-block so the IDE does not complain.
        try (var walk = new RevWalk(this.reader))
        {
            tree = walk.parseCommit(branch).getTree();
        }

        var tags = new ArrayList<TreeTag>();

        // Same story as RevWalk.
        try (var walk = new TreeWalk(this.reader))
        {
            walk.setRecursive(true);
            var pos = walk.addTree(tree);

            while (walk.next())
            {
                var path = walk.getPathString();
                if (!filter.allowed(path)) continue;
                tags.add(this.getTreeTag(walk.getObjectId(pos), path));
            }
        }

        return tags;
    }

    private TreeTag getTreeTag(ObjectId id, String path) throws IOException
    {
        if (id.equals(ObjectId.zeroId())) return null;

        try
        {
            var loader = this.source.open(path, id);
            return this.tagCache.get(id, path, loader.getCachedBytes());
        }
        catch (MissingObjectException e)
        {
            // Might be a submodule
            // TODO: Log a warning
            return null;
        }
    }

    @Override
    public void close() throws Exception
    {
        this.reader.close();
    }
}
