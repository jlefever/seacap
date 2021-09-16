export default interface Ord<T> {
    compare(other: T): number;
}