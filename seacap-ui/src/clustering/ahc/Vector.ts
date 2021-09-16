export default interface Vector<T> {
    dim: number;
    toArray: () => readonly T[];
}