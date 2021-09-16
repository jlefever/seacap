/**
 * A directed edge between `S` and `T`.
 */
export default interface Edge<S, T> {
    src: S;
    tgt: T;
}