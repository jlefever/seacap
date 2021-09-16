import * as tf from "@tensorflow/tfjs-core";

export default interface Relation<S = any, T = any> {
    readonly sources: readonly S[];
    readonly targets: readonly T[];
    indexForSource(source: S): number;
    indexForTarget(target: T): number;
    sourceForIndex(index: number): S;
    targetForIndex(index: number): T;
    toMatrix(): tf.Tensor2D;
}