import DepDto from "../dtos/DepDto";
import { Entity } from "./Entity";

export default class Dep {
    private readonly _source: Entity;
    private readonly _target: Entity;
    private readonly _dtos: readonly DepDto[];

    constructor(source: Entity, target: Entity, dtos: readonly DepDto[]) {
        this._source = source;
        this._target = target;
        this._dtos = dtos;
    }

    public get source() {
        return this._source;
    }

    public get target() {
        return this._target;
    }

    public get dtos() {
        return this._dtos;
    }
}