import ChangeDto from "../dtos/ChangeDto";
import DepDto from "../dtos/DepDto";
import EntityDto from "../dtos/EntityDto";
import Change from "./Change";
import Dep from "./Dep";
import { Entity } from "./Entity";

export function createEntities(entityDtos: readonly EntityDto[]) {
    const entities = new Map<number, Entity>();
    entityDtos.map(dto => entities.set(dto.id, new Entity(dto)));

    entities.forEach((entity, _) => {
        if (entity.dto.parentId !== undefined) {
            entity.setParent(entities.get(entity.dto.parentId)!);
        }
    });

    return entities;
}

export function createChanges(entities: Map<number, Entity>, dtos: readonly ChangeDto[]) {
    dtos = dtos.filter(dto => entities.has(dto.entityId));
    const changes = new Map<number, Change>();
    dtos.map(dto => changes.set(dto.id, new Change(dto.id, dto.commitHash, entities.get(dto.entityId)!, dto.churn)));
    changes.forEach(change => change.entity.addChange(change));
    return changes;
}

export function createDeps(entities: Map<number, Entity>, dtos: readonly DepDto[]) {
    const depGroups = new Map<string, DepDto[]>();

    dtos.forEach(dto => {
        const key = `${dto.sourceId}->${dto.targetId}`;

        if (!depGroups.has(key)) {
            depGroups.set(key, []);
        }

        depGroups.get(key)?.push(dto);
    });

    var deps = new Array<Dep>();

    depGroups.forEach((group, _) => {
        const source = entities.get(group[0].sourceId)!;
        const target = entities.get(group[0].targetId)!;
        deps.push(new Dep(source, target, group));
    })

    return deps;
}