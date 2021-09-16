import Cluster from "./Cluster";
import Vector from "./Vector";

export default interface Linker<T, V extends Vector<T>> {
    dist(a: Cluster<T, V>, b: Cluster<T, V>): number;
}