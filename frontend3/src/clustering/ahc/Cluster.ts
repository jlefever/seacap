import Vector from "./Vector";

export default interface Cluster<T, V extends Vector<T>> {
    toArray(): readonly V[];
    value: V | undefined;
    children: readonly Cluster<T, V>[];
}