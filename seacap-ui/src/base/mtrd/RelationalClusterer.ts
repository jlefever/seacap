import * as tf from "@tensorflow/tfjs";
import { kmeans } from "../../tfext/kmeans";
// @ts-ignore
// import nd from "nd4js";
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
            throw new Error("Relation target has wrong size.");
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
        // console.log(`(${i} <${typeof i}>, ${j} <${typeof j}>)`);
        return this._relations.get(i)?.get(j);
    }

    cluster() {
        const m = this._shapes.keys().length;
        const initializer = tf.initializers.orthogonal({ gain: 1 });
        let indicators = this._shapes.mapEntries((_, shape) => initializer.apply(shape) as tf.Tensor2D);

        // 10 times means convergance right?
        for (let i = 0; i < 10; i++) {
            for (let p = 0; p < m; p++) {
                const summands = [];

                for (let j = 0; j < m; j++) {
                    if (j === p) continue;

                    const R = this.getRelation(p, j)!.toMatrix();
                    const C = indicators[j];
                    const RC = tf.matMul(R, C);
                    summands.push(tf.matMul(RC, RC, false, true));
                }

                const M = tf.addN(summands) as tf.Tensor2D;
                indicators[p] = eigenvectors(M, this.getNumClusters(p));
            }

            // console.log(`Iteration ${i}:`);
            // indicators.forEach(c => {
            //     c.print();
            // });
        }

        const clusterss: number[][][] = [];

        indicators.forEach(c => {
            const rows = c.shape[0];
            const cols = c.shape[1];

            const samples = [];

            for (let i = 0; i < rows; i++) {
                const ex = tf.slice2d(c, [i, 0], [1, -1]).reshape([-1]);
                ex.print();
                samples.push(ex as tf.Tensor1D);
            }

            clusterss.push((kmeans(samples, cols) as number[][]));
        });

        return clusterss;
    }
}

function eigenvectors(A: tf.Tensor2D, count: number) {
    let B = tf.clone(A);
    let E = tf.eye(A.shape[0]);
    let i = 0;

    while (1) {
        i += 1;

        let [Q, R] = tf.linalg.qr(B);

        // dirty hack
        Q = nanToZero(Q as tf.Tensor2D);
        R = nanToZero(R as tf.Tensor2D);

        B = tf.matMul(R, Q);
        E = tf.matMul(E, Q);

        // console.log(`B_${i}`);
        // B.print();
        // console.log(`E_${i}:`);
        // E.print();

        const maxOffDiag = tf.max(tf.sub(B, tf.linalg.bandPart(B, 0, 0)));

        if ((maxOffDiag.arraySync() as number) < 1e-5 || i > 50) {
            break;
        }
    }

    // console.log(`Stopped after ${i} iterations.`);
    return tf.slice2d(E, [0, 0], [E.shape[0], count]);

    // sanity check
    // const x = tf.slice2d(E, [0, 0], [E.shape[0], 1]).reshape([E.shape[0]]);
    // const y = tf.slice2d(E, [0, 1], [E.shape[0], 1]).reshape([E.shape[0]]);
    // tf.norm(x).print();
    // tf.norm(y).print();
    // tf.dot(x, y).print();
}

// Assuming A is a square matrix
function nanToZero(A: tf.Tensor2D): tf.Tensor2D {
    const buffer = tf.buffer(A.shape, A.dtype, A.dataSync());
    const n = A.shape[0];

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const curr = (buffer.get(i, j) as number);

            if (Number.isNaN(curr) || !Number.isFinite(curr)) {
                buffer.set(0, i, j);
            } else {
                buffer.set(curr, i, j);
            }
        }
    }

    return buffer.toTensor() as tf.Tensor2D;
}

// export function randUnit(shape: number[]) {
//     const r = tf.randomUniform(shape);
//     return tf.div(r, tf.norm(r, "euclidean"));
// }

// function lanczos(A: tf.Tensor2D, m: number) {
//     const n = A.shape[0];
//     const v_1 = randUnit([n]);
//     const w_1p = tf.matMul(A, v_1);
//     const a_1 = tf.dot(w_1p, v_1);
//     const w_1 = tf.sub(w_1p, tf.matMul(a_1, v_1));
// }