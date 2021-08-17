package net.jlefever.dsmutils.clique;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;

public class CliqueFinder<V, E extends Edge<V>>
{
    private final Graph<V, E> graph;
    private final Map<V, V> members;
    private final Set<V> visited;
    private final LinkedList<V> history;

    public CliqueFinder(Graph<V, E> graph)
    {
        this.graph = graph;
        this.members = new HashMap<V, V>();
        this.visited = new HashSet<V>();
        this.history = new LinkedList<V>();
    }

    public List<List<V>> find()
    {
        for (var vertex : this.graph.getVertices())
        {
            this.visit(vertex);
        }

        for (var vertex : this.history)
        {
            this.assign(vertex, vertex);
        }

        return CliqueFinder.toCliqueList(this.members);
    }

    private void visit(V vertex)
    {
        if (this.visited.contains(vertex))
        {
            return;
        }

        this.visited.add(vertex);

        for (var outgoing : this.graph.getOutgoing(vertex))
        {
            this.visit(outgoing);
        }

        this.history.addFirst(vertex);
    }

    private void assign(V member, V root)
    {
        if (this.members.containsKey(member))
        {
            return;
        }

        this.members.put(member, root);

        for (var incoming : this.graph.getIncoming(member))
        {
            this.assign(incoming, root);
        }
    }

    private static <V> List<List<V>> toCliqueList(Map<V, V> members)
    {
        var roots = new HashMap<V, List<V>>();

        for (var pair : members.entrySet())
        {
            var root = pair.getValue();
            var clique = roots.get(root);

            if (clique == null)
            {
                clique = new ArrayList<>();
                roots.put(root, clique);
            }

            clique.add(pair.getKey());
        }

        var cliques = new ArrayList<>(roots.values());

        cliques.removeIf(new Predicate<List<V>>()
        {
            @Override
            public boolean test(List<V> clique)
            {
                return clique.size() < 2;
            };
        });

        cliques.sort(new Comparator<List<V>>()
        {
            @Override
            public int compare(List<V> o1, List<V> o2)
            {
                var diff = o2.size() - o1.size();

                if (diff != 0)
                {
                    return diff;
                }

                return Objects.hashCode(o2) - Objects.hashCode(o1);
            }
        });

        return cliques;
    }
}
