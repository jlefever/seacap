package net.jlefever.seacap.clique;

import java.util.Collection;

public interface Graph<V, E extends Edge<V>>
{
    Collection<V> getVertices();
    Collection<V> getOutgoing(V vertex);
    Collection<V> getIncoming(V vertex);

    Collection<E> getEdges();
    Collection<E> getOutgoingEdges(V vertex);
    Collection<E> getIncomingEdges(V vertex);

    boolean contains(V vertex);
    boolean contains(E edge);
}
