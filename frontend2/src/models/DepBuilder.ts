import * as R from "ramda";
import DepDto from "../dtos/DepDto";
import Dep from "./Dep";
import Entity from "./Entity";

export default class DepBuilder {
    private readonly _entities: Map<number, Entity>;
    private readonly _dtos: readonly DepDto[];

    constructor(entities: Map<number, Entity>, dtos: readonly DepDto[]) {
        this._entities = entities;
        this._dtos = dtos;
    }

    private getEntity(id: number): Entity {
        const entity = this._entities.get(id);

        if (entity === undefined) {
            throw new Error("missing entity");
        }

        return entity;
    }

    build(): readonly Dep[] {
        return R.map(
            d => new Dep(d.id, this.getEntity(d.sourceId), this.getEntity(d.targetId), d.kind, d.weight),
            this._dtos
        );
    }
}