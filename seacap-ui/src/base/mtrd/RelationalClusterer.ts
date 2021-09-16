import * as tf from "@tensorflow/tfjs";
import Dict from "../dict/Dict";
import HashDict from "../dict/HashDict";
import Relation from "./Relation";

type Shape = [n: number, k: number];

export default class RelationalClusterer {
    private readonly _shapes: Dict<number, Shape> = new HashDict<number, Shape>();
    private readonly _relations: Dict<number, Dict<number, Relation>> = new HashDict<number, Dict<number, Relation>>();

    setNumClusters(i: number, k: number) {
        const [n, _] = this._shapes.getOrDefault(i, () => [0, 0]);
        this._shapes.set(i, [n, k]);
    }

    setSize(i: number, n: number) {
        const [_, k] = this._shapes.getOrDefault(i, () => [0, 0]);
        this._shapes.set(i, [n, k]);
    }

    // need to manually set all relations
    setRelation(i: number, j: number, relation: Relation) {
        if (relation.sources.length != this.getSize(i)) {
            throw new Error("Relation source has wrong size.");
        }

        if (relation.targets.length != this.getSize(j)) {
            throw new Error("Relation source has wrong size.");
        }

        this._relations.getOrSet(i, () => new HashDict<number, Relation>()).set(j, relation);
    }

    getSize(i: number) {
        return this._shapes.get(i)![0];
    }

    getNumClusters(i: number) {
        return this._shapes.get(i)![1];
    }

    getRelation(i: number, j: number) {
        return this._relations.get(i)?.get(j);
    }

    getRelationsFor(i: number) {
        return this._relations.get(i);
    }

    cluster(seed: number) {
        const ortho = tf.initializers.orthogonal({ seed, gain: 1 });
        let indicators = HashDict.fromList(this._shapes.map((i, shape) => [i, ortho.apply(shape) as tf.Tensor2D]));

        while (1) {
            indicators = HashDict.fromList(indicators.map((i, c) => (
                [i, tf.addN(this.getRelationsFor(i)!.map((_, r) => {
                    const rc = tf.matMul(r.toMatrix(), c);
                    return tf.matMul(rc, rc);
                })) as tf.Tensor2D]
            )));
        }
    }

    // getClusterIndicator(i: number) {

    // }

    // getAssociation(i: number, j: number) {

    // }
}

function toKey(i: number, j: number) {
    return (i << 6) + j;
}

function toI(key: number) {
    return key >> 6;
}

function toJ(key: number) {
    return ((1 << 7) - 1) & key;
}