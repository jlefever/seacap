import Vector from "./Vector";

export default class TaggedVector<T, E> implements Vector<T> {
    private readonly _vec: Vector<T>;
    private readonly _tag: E;

    constructor(vec: Vector<T>, tag: E) {
        this._vec = vec;
        this._tag = tag;
    }

    get tag() {
        return this._tag;
    }

    get dim() {
        return this._vec.dim;
    }

    toArray() {
        return this._vec.toArray();
    }

    toString() {
        return this._vec.toString();
    }
}