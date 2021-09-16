import * as tf from "@tensorflow/tfjs-core";
import Dict from "../dict/Dict";
import HashDict from "../dict/HashDict";
import SimpleEdgeSet from "../graph/SimpleEdgeSet";
import Hashable from "../Hashable";
import Relation from "./Relation";

export default class RelationImpl<S extends Hashable, T extends Hashable> implements Relation<S, T> {
    private readonly _edges: SimpleEdgeSet<S, T>;
    private readonly _sourceIndices: Dict<S, number> = new HashDict<S, number>();
    private readonly _targetIndices: Dict<T, number> = new HashDict<T, number>();
    private _matrix?: tf.Tensor2D;

    constructor(edges: SimpleEdgeSet<S, T>) {
        this._edges = edges;
        this._edges.sources.forEach((source, index) => this._sourceIndices.set(source, index));
        this._edges.targets.forEach((target, index) => this._targetIndices.set(target, index));
    }

    get sources() {
        return this._edges.sources;
    }

    get targets() {
        return this._edges.targets;
    }

    indexForSource(source: S): number {
        // TODO: Handle undefined
        return this._sourceIndices.get(source)!;
    }

    indexForTarget(target: T): number {
        // TODO: Handle undefined
        return this._targetIndices.get(target)!;
    }

    sourceForIndex(index: number): S {
        return this._edges.sources[index];
    }

    targetForIndex(index: number): T {
        return this._edges.targets[index];
    }

    toMatrix(): tf.Tensor2D {
        if (!this._matrix) {
            this._matrix = this.createMatrix();
        }

        return this._matrix;
    }

    private createMatrix(): tf.Tensor2D {
        const { sources, targets } = this._edges;
        const matrix = tf.buffer<tf.Rank.R2>([sources.length, targets.length]);

        sources.forEach((src, srcIndex) => {
            this._edges.targetsOf(src).forEach(tgt => {
                matrix.set(1, srcIndex, this.indexForTarget(tgt));
            });
        });

        return matrix.toTensor();
    }
}