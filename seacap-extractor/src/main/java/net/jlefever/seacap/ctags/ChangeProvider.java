package net.jlefever.seacap.ctags;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.eclipse.jgit.diff.EditList;

public class ChangeProvider<R>
{
    private final R rev;

    public ChangeProvider(R rev)
    {
        this.rev = rev;
    }

    public List<Change<TreeTag, R>> get(TreeTag a, TreeTag b, EditList edits)
    {
        if (a == null && b == null)
        {
            throw new RuntimeException("At least one of `a` or `b` must be non-null.");
        }

        if (a == null) return all(b, ChangeKind.ADDED);

        if (b == null) return all(a, ChangeKind.DELETED);

        var tags = new HashSet<TreeTag>();

        for (var edit : edits)
        {
            int lineno;

            for (lineno = edit.getBeginA(); lineno < edit.getEndA(); lineno++)
            {
                tags.addAll(a.getInnermostTags(lineno));
            }

            for (lineno = edit.getBeginB(); lineno < edit.getEndB(); lineno++)
            {
                tags.addAll(b.getInnermostTags(lineno));
            }
        }

        var changes = new ArrayList<Change<TreeTag, R>>();

        for (var tag : tags)
        {
            ChangeKind kind;

            if (a.contains(tag))
            {
                if (b.contains(tag)) kind = ChangeKind.MODIFIED;
                else kind = ChangeKind.DELETED;
            }
            else
            {
                if (b.contains(tag)) kind = ChangeKind.ADDED;
                else throw new RuntimeException();
            }

            changes.add(new ChangeImpl<TreeTag, R>(tag, this.rev, kind));
        }

        return changes;
    }

    private List<Change<TreeTag, R>> all(TreeTag tag, ChangeKind kind)
    {
        // TODO: Too many ArrayList initializations
        var changes = new ArrayList<Change<TreeTag, R>>();
        changes.add(new ChangeImpl<TreeTag, R>(tag, this.rev, kind));

        for (var child : tag.getChildren())
        {
            changes.addAll(all(child, kind));
        }

        return changes;
    }
}
