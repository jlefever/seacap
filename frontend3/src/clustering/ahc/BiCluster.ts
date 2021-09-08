import Cluster from "./Cluster";
import Vector from "./Vector";

export default class BiCluster<T, V extends Vector<T>> implements Cluster<T, V> {
    private readonly _left: Cluster<T, V>;
    private readonly _right: Cluster<T, V>;

    private constructor(left: Cluster<T, V>, right: Cluster<T, V>) {
        this._left = left;
        this._right = right;

        this.toArray = this.toArray.bind(this);
    }

    public static merge<T, V extends Vector<T>>(left: Cluster<T, V>, right: Cluster<T, V>) {
        return new BiCluster(left, right);
    }

    toArray() {
        return this._left.toArray().concat(this._right.toArray());
    }

    get value() {
        return undefined;
    }

    get children() {
        return [this._left, this._right];
    }
}