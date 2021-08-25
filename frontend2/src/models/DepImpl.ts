import Dep from "./Dep";
import Entity from "./Entity";

export default class DepImpl implements Dep {
    private readonly _id: number;
    private readonly _source: Entity;
    private readonly _target: Entity;
    private readonly _kind: string;
    private readonly _weight: number;

    constructor(id: number, source: Entity, target: Entity, kind: string, weight: number) {
        this._id = id;
        this._source = source;
        this._target = target;
        this._kind = kind;
        this._weight = weight;
    }

    public get id() {
        return this._id;
    }

    public get source() {
        return this._source;
    }

    public get target() {
        return this._target;
    }

    public get kind() {
        return this._kind;
    }

    public get weight() {
        return this._weight;
    }
}

// tail = source
// head = target

// function bubbleHead(dep: Dep) {
//     dep.target.ancestory.map(a => new)
// }