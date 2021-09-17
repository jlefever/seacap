import Dict from "../dict/Dict";
import HashDict from "../dict/HashDict";
import Hashable from "../Hashable";
import Edge from "./Edge";
import EdgeBag from "./EdgeBag";

export default class EdgeSetImpl<S extends Hashable, T extends Hashable, E extends Edge<S, T>> implements EdgeBag<S, T, E> {
    private readonly _edges: readonly E[];
    private readonly _sources: readonly S[];
    private readonly _targets: readonly T[];
    private readonly _vertices: readonly (S | T)[];
    private readonly _outgoingEdges: Dict<S, readonly E[]>;
    private readonly _incomingEdges: Dict<T, readonly E[]>;
    private readonly _outgoing: Dict<S, Dict<T, readonly E[]>>;
    private readonly _incoming: Dict<T, Dict<S, readonly E[]>>;

    constructor(edges: E[]) {
        this._edges = edges;

        const { groupBy } = HashDict;

        this._outgoingEdges = groupBy(edges, e => e.src);
        this._incomingEdges = groupBy(edges, e => e.tgt);

        this._outgoing = this._outgoingEdges.map((_, es) => groupBy(es, e => e.tgt));
        this._incoming = this._incomingEdges.map((_, es) => groupBy(es, e => e.src));

        this._sources = this._outgoing.keys();
        this._targets = this._incoming.keys();
        this._vertices = (this._sources as (S | T)[]).concat(this._targets);
    }

    public get edges() {
        return this._edges;
    }

    public get vertices() {
        return this._vertices;
    }

    public get sources() {
        return this._sources;
    }

    public get targets() {
        return this._targets;
    }

    outgoing(source: S): T[] {
        const adj = this._outgoing.get(source);
        if (!adj) return [];
        return adj.keys();
    }

    incoming(target: T): readonly S[] {
        const adj = this._incoming.get(target);
        if (!adj) return [];
        return adj.keys();
    }

    outgoingEdges(source: S) {
        const adj = this._outgoingEdges.get(source);
        if (!adj) return [];
        return adj;
    }

    incomingEdges(target: T) {
        const adj = this._incomingEdges.get(target);
        if (!adj) return [];
        return adj;
    }

    between(source: S, target: T) {
        const adj = this._outgoing.get(source);
        if (!adj) return [];
        const edges = adj.get(target);
        if (!edges) return [];
        return edges;
    }
}