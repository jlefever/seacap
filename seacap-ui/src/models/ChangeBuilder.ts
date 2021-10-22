import * as R from "ramda";
import ChangeDto from "./ChangeDto";
import Change from "./Change";
import Entity from "./Entity";

export default class ChangeBuilder {
    private readonly _entities: Map<number, Entity>;
    private readonly _dtos: readonly ChangeDto[];

    constructor(entities: Map<number, Entity>, dtos: readonly ChangeDto[]) {
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

    build(): readonly Change[] {
        return R.map(
            d => new Change(d.id, d.commitHash, this.getEntity(d.entityId), d.kind),
            this._dtos
        );
    }
}