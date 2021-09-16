import Cluster from "./Cluster";
import Vector from "./Vector";

export default class Singleton<T, V extends Vector<T>> implements Cluster<T, V> {
    private readonly _vector: V;

    private constructor(vector: V) {
        this._vector = vector;

        this.toArray = this.toArray.bind(this);
    }

    public static wrap<T, V extends Vector<T>>(vector: V) {
        return new Singleton(vector);
    }

    public get vector() {
        return this._vector;
    }

    toArray() {
        return [this._vector];
    }

    get value() {
        return this.vector;
    }

    get children() {
        return [];
    }
}