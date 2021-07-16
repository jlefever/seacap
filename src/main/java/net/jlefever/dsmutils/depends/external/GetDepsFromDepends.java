package net.jlefever.dsmutils.depends.external;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

import depends.LangRegister;
import depends.deptypes.DependencyType;
import depends.entity.Entity;
import depends.extractor.LangProcessorRegistration;
import depends.generator.StructureDependencyGenerator;
import depends.relations.BindingResolver;
import depends.relations.RelationCounter;
import multilang.depends.util.file.FolderCollector;
import multilang.depends.util.file.path.UnixPathFilenameWritter;
import multilang.depends.util.file.strip.LeadingNameStripper;
import net.jlefever.dsmutils.depends.Dep;
import net.jlefever.dsmutils.depends.DependsEntity;

public class GetDepsFromDepends
{
    private final String dir;
    private final String lang;

    public GetDepsFromDepends(String dir, String lang)
    {
        this.dir = dir;
        this.lang = lang;
    }

    public Map<Dep, Integer> execute()
    {
        var includeDir = new String[]{};
        var includePathCollector = new FolderCollector();
        var additionalIncludePaths = includePathCollector.getFolders(this.getDir());
        additionalIncludePaths.addAll(Arrays.asList(includeDir));
        includeDir = additionalIncludePaths.toArray(new String[]{});
        System.out.println(includeDir);

        new LangRegister().register();
        var processor = LangProcessorRegistration.getRegistry().getProcessorOf(this.getLang());
        var resolver = new BindingResolver(processor.getEntityRepo(), processor.getImportLookupStrategy(),
                processor.getBuiltInType(), false, true);
        var entityRepo = processor.buildDependencies(this.getDir(), includeDir, resolver);
        new RelationCounter(entityRepo, false, processor, resolver).computeRelations();

        var dependencyGenerator = new StructureDependencyGenerator();
        dependencyGenerator.setLeadingStripper(new LeadingNameStripper(true, this.getDir(), new String[]{}));
        dependencyGenerator.setGenerateDetail(true);
        dependencyGenerator.setFilenameRewritter(new UnixPathFilenameWritter());

        var matrix = dependencyGenerator.build(entityRepo, DependencyType.allDependencies());

        var deps = new HashMap<Dep, Integer>();

        for (var pair : matrix.getDependencyPairs())
        {
            var from = entityRepo.getEntity(pair.getFrom());
            var to = entityRepo.getEntity(pair.getTo());

            for (var dependency : pair.getDependencies())
            {
                if (getEntityKind(from).equals("file") || getEntityKind(to).equals("file"))
                {
                    System.out.println("Warning: Skipping file...");
                    continue;
                }

                if (getEntityKind(from).equals("package") || getEntityKind(to).equals("package"))
                {
                    System.out.println("Warning: Skipping package...");
                    continue;
                }

                var src = getDependsEntity(from);
                var dst = getDependsEntity(to);
                var kind = dependency.getType().toLowerCase();
                var weight = dependency.getWeight();
                var dep = new Dep(src, dst, kind);

                if (deps.containsKey(dep))
                {
                    deps.put(dep, deps.get(dep) + weight);
                }
                else
                {
                    deps.put(dep, weight);
                }
            }
        }

        return deps;
    }

    private DependsEntity getDependsEntity(Entity entity)
    {
        return getAncestory(entity).getLast();
    }

    private LinkedList<DependsEntity> getAncestory(Entity entity)
    {
        var name = getEntityName(entity);
        var kind = getEntityKind(entity);

        if (getEntityKind(entity.getParent()).equals("file"))
        {
            var path = getEntityName(entity.getParent()).substring(getDir().length());
            var depEntity = new DependsEntity(name, kind, path);
            return new LinkedList<DependsEntity>(Arrays.asList(depEntity));
        }

        var ancestors = getAncestory(entity.getParent());
        var parent = ancestors.getLast();
        var depEntity = new DependsEntity(name, kind, parent.getPath(), parent);
        ancestors.addLast(depEntity);
        return ancestors;
    }

    private static String getEntityName(Entity entity)
    {
        return entity.getRawName().getName();
    }

    private static String getEntityKind(Entity entity)
    {
        var name = entity.getClass().getSimpleName();
        return name.substring(0, name.length() - "Entity".length()).toLowerCase();
    }

    // private static String getPath(Entity entity)
    // {
    //     if (getEntityKind(entity).equals("file"))
    //     {
    //         return entity.getDisplayName();
    //     }

    //     return getPath(entity.getParent());
    // }

    // private static String toEntityString(Entity entity)
    // {
    //     var parent = entity.getParent();

    //     if (parent == null)
    //     {
    //         // return entity.getRawName().getName();
    //         return getEntityKind(entity);
    //     }

    //     return toEntityString(parent) + " > " + getEntityKind(entity);
    // }

    public String getDir()
    {
        if (dir.endsWith("/"))
        {
            return this.dir;
        }

        return this.dir + "/";
    }

    public String getLang()
    {
        return this.lang;
    }
}
