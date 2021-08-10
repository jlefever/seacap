package net.jlefever.dsmutils.depends;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
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

public class GetDepsFromDepends
{
    public Map<Dep, Integer> call(String dir, String lang, List<String> paths)
    {
        dir = ensureTrailingSlash(dir);

        var includeDir = new String[]
        {};
        var includePathCollector = new FolderCollector();
        var additionalIncludePaths = includePathCollector.getFolders(dir);
        additionalIncludePaths.addAll(Arrays.asList(includeDir));
        includeDir = additionalIncludePaths.toArray(new String[]
        {});

        new LangRegister().register();
        var processor = LangProcessorRegistration.getRegistry().getProcessorOf(lang);
        var resolver = new BindingResolver(processor.getEntityRepo(), processor.getImportLookupStrategy(),
                processor.getBuiltInType(), false, true);
        var entityRepo = processor.buildDependencies(dir, includeDir, resolver);
        new RelationCounter(entityRepo, false, processor, resolver).computeRelations();

        var dependencyGenerator = new StructureDependencyGenerator();
        dependencyGenerator.setLeadingStripper(new LeadingNameStripper(true, dir, new String[]
        {}));
        dependencyGenerator.setGenerateDetail(false);
        dependencyGenerator.setFilenameRewritter(new UnixPathFilenameWritter());

        var matrix = dependencyGenerator.build(entityRepo, DependencyType.allDependencies());

        var deps = new HashMap<Dep, Integer>();

        for (var pair : matrix.getDependencyPairs())
        {
            var from = entityRepo.getEntity(pair.getFrom());
            var to = entityRepo.getEntity(pair.getTo());

            if (getEntityKind(from).equals("package") || getEntityKind(to).equals("package"))
            {
                continue;
            }

            for (var dependency : pair.getDependencies())
            {
                var source = rewrite(getDependsEntity(dir, from));
                var target = rewrite(getDependsEntity(dir, to));
                var kind = dependency.getType().toLowerCase();
                var dep = new Dep(source, target, kind);

                if (!isPathAllowed(paths, dep))
                {
                    continue;
                }
                
                if (deps.containsKey(dep))
                {
                    deps.put(dep, deps.get(dep) + dependency.getWeight());
                }
                else
                {
                    deps.put(dep, dependency.getWeight());
                }
            }
        }

        return deps;
    }

    private ExternalEntity getDependsEntity(String dir, Entity entity)
    {
        return getAncestory(dir, entity).getLast();
    }

    private LinkedList<ExternalEntity> getAncestory(String dir, Entity entity)
    {
        var name = getEntityName(entity);
        var kind = getEntityKind(entity);

        if (kind.equals("file"))
        {
            var path = name.substring(dir.length());
            var depEntity = new ExternalEntity(path, kind);
            return new LinkedList<ExternalEntity>(Arrays.asList(depEntity));
        }

        var ancestors = getAncestory(dir, entity.getParent());
        var parent = ancestors.getLast();
        var depEntity = new ExternalEntity(name, kind, parent);
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

    private static String ensureTrailingSlash(String dir)
    {
        if (dir.endsWith("/"))
        {
            return dir;
        }

        return dir + "/";
    }

    private static boolean isPathAllowed(List<String> paths, Dep dep)
    {
        var srcPath = dep.getSource().getPath();
        var tgtPath = dep.getTarget().getPath();
        return paths.contains(srcPath) && paths.contains(tgtPath);
    }

    private static ExternalEntity rewrite(ExternalEntity entity)
    {
        if (!entity.hasParent() || !entity.getKind().equals("function"))
        {
            return entity;
        }

        if (!entity.getParent().getKind().equals("function"))
        {
            return entity;
        }

        return rewrite(entity.getParent());
    }
}
