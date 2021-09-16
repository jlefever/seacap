package net.jlefever.seacap.clique;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class GraphImpl<V, E extends Edge<V>> implements Graph<V, E>
{
    private final Set<E> edges;
    private final Set<V> vertices;
    private final Map<V, Set<E>> outgoing;
    private final Map<V, Set<E>> incoming;

    public GraphImpl(Collection<E> edges)
    {
        this.edges = GraphImpl.createEdgeSet(edges);
        this.vertices = GraphImpl.createVertexSet(edges);
        this.outgoing = GraphImpl.createOutgoingEdges(edges);
        this.incoming = GraphImpl.createIncomingEdges(edges);
    }

    @Override
    public Collection<V> getVertices()
    {
        return Collections.unmodifiableCollection(this.vertices);
    }

    @Override
    public Collection<V> getOutgoing(V vertex)
    {
        var edges = this.getOutgoingEdges(vertex);

        if (edges == null)
        {
            return null;
        }

        var vertices = new HashSet<V>();

        for (var edge : edges)
        {
            vertices.add(edge.getTarget());
        }

        return Collections.unmodifiableCollection(vertices);
    }

    @Override
    public Collection<V> getIncoming(V vertex)
    {
        var edges = this.getIncomingEdges(vertex);

        if (edges == null)
        {
            return null;
        }

        var vertices = new HashSet<V>();

        for (var edge : edges)
        {
            vertices.add(edge.getSource());
        }

        return Collections.unmodifiableCollection(vertices);
    }

    @Override
    public Collection<E> getEdges()
    {
        return Collections.unmodifiableCollection(this.edges);
    }

    @Override
    public Collection<E> getOutgoingEdges(V vertex)
    {
        if (!this.contains(vertex))
        {
            return null;
        }

        var outgoing = this.outgoing.get(vertex);

        if (outgoing == null)
        {
            return Collections.emptyList();
        }

        return Collections.unmodifiableCollection(outgoing);
    }

    @Override
    public Collection<E> getIncomingEdges(V vertex)
    {
        if (!this.contains(vertex))
        {
            return null;
        }

        var incoming = this.incoming.get(vertex);

        if (incoming == null)
        {
            return Collections.emptyList();
        }

        return Collections.unmodifiableCollection(incoming);
    }

    public boolean contains(V vertex)
    {
        return this.vertices.contains(vertex);
    }

    public boolean contains(E edge)
    {
        return this.edges.contains(edge);
    }

    private static <V, E extends Edge<V>> Set<V> createVertexSet(Collection<E> edges)
    {
        var vertices = new HashSet<V>();

        for (var dep : edges)
        {
            vertices.add(dep.getSource());
            vertices.add(dep.getTarget());
        }

        return vertices;
    }

    private static <V, E extends Edge<V>> Set<E> createEdgeSet(Collection<E> edges)
    {
        var set = new HashSet<E>();
        set.addAll(edges);
        return set;
    }

    private static <V, E extends Edge<V>> Map<V, Set<E>> createOutgoingEdges(Collection<E> edges)
    {
        var adj = new HashMap<V, Set<E>>();

        for (var edge : edges)
        {
            var outgoingEdges = adj.get(edge.getSource());

            if (outgoingEdges == null)
            {
                outgoingEdges = new HashSet<>();
                adj.put(edge.getSource(), outgoingEdges);
            }

            outgoingEdges.add(edge);
        }

        return adj;
    }

    private static <V, E extends Edge<V>> Map<V, Set<E>> createIncomingEdges(Collection<E> edges)
    {
        var adj = new HashMap<V, Set<E>>();

        for (var edge : edges)
        {
            var incomingEdges = adj.get(edge.getTarget());

            if (incomingEdges == null)
            {
                incomingEdges = new HashSet<>();
                adj.put(edge.getTarget(), incomingEdges);
            }

            incomingEdges.add(edge);
        }

        return adj;
    }
}
