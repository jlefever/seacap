import Dict from "../dict/Dict";
import HashDict from "../dict/HashDict";
import Hashable from "../Hashable";
import Edge from "./Edge";
import EdgeSet from "./EdgeSet";

export default class EdgeSetImpl<S extends Hashable, T extends Hashable, E extends Edge<S, T>> implements EdgeSet<S, T, E> {
    private readonly _edges: readonly E[];
    private readonly _sources: readonly S[];
    private readonly _targets: readonly T[];
    private readonly _sourceDict: Dict<S, Dict<T, readonly E[]>>;
    private readonly _targetDict: Dict<T, Dict<S, readonly E[]>>;

    constructor(edges: E[]) {
        this._edges = edges;

        const { groupBy, fromList } = HashDict;
        this._sourceDict = fromList(groupBy(edges, e => e.src).map((v, es) => [v, groupBy(es, e => e.tgt)]));
        this._targetDict = fromList(groupBy(edges, e => e.tgt).map((v, es) => [v, groupBy(es, e => e.src)]));

        this._sources = this._sourceDict.keys();
        this._targets = this._targetDict.keys();
    }

    public get edges() {
        return this._edges;
    }

    public get sources() {
        return this._sources;
    }

    public get targets() {
        return this._targets;
    }

    targetsOf(source: S): T[] {
        const adj = this._sourceDict.get(source);
        if (!adj) return [];
        return adj.keys();
    }

    sourcesOf(target: T): readonly S[] {
        const adj = this._targetDict.get(target);
        if (!adj) return [];
        return adj.keys();
    }
}