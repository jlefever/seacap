import Vector from "./Vector";

export default class ArrVector<T> implements Vector<T> {
    private readonly _arr: readonly T[];

    constructor(arr: readonly T[]) {
        this._arr = arr;

        this.toArray = this.toArray.bind(this);
        this.toString = this.toString.bind(this);
    }

    get dim() {
        return this._arr.length;
    }

    toArray() {
        return this._arr;
    }

    toString() {
        return "[" + this._arr.join(",") + "]";
    }
}