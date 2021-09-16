import * as R from "ramda";
import EntityDto from "../dtos/EntityDto";
import Entity from "./Entity";
import EntityImpl from "./EntityImpl";
import LineRange from "./LineRange";

export default class EntityBuilder {
    private readonly _dtos: readonly EntityDto[];

    constructor(dtos: readonly EntityDto[]) {
        this._dtos = dtos;
    }

    build(): Map<number, Entity> {
        const entities = R.map(d => new EntityImpl(d.id, d.name, d.kind, getLinenos(d)), this._dtos);

        const dict = new Map<number, EntityImpl>();
        R.map(e => dict.set(e.id, e), entities);

        const subFiles = R.filter(d => d.parentId !== undefined, this._dtos);
        R.map(d => dict.get(d.id)?.setParent(dict.get(d.parentId!)!), subFiles);

        return dict;
    }
}

function getLinenos(dto: EntityDto): LineRange | null {
    if (!dto.fromLineno || !dto.toLineno) {
        return null;
    }

    return [dto.fromLineno, dto.toLineno];
}