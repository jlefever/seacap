export default interface Edge<S, T> {
    readonly src: S;
    readonly tgt: T;
}