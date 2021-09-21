import _ from "lodash";
import Change from "../models/Change";
import Entity from "../models/Entity";

export const entityIconFor = (kind: string) => {
    if (kind === "file") {
        return "vs-symbol-file";
    }

    if (kind === "class") {
        return "vs-symbol-class";
    }

    if (kind === "interface") {
        return "vs-symbol-interface";
    }

    if (kind === "method") {
        return "vs-symbol-method";
    }

    if (kind === "field") {
        return "vs-symbol-field";
    }

    if (kind === "enum") {
        return "vs-symbol-enum";
    }

    if (kind === "enumConstant") {
        return "vs-symbol-enum-member";
    }

    return "vs-symbol-misc";
}

const entityKindNum = (kind: string) => {
    if (kind === "file") {
        return 0;
    }

    if (kind === "interface") {
        return 1;
    }

    if (kind === "enum") {
        return 2;
    }

    if (kind === "class") {
        return 3;
    }

    if (kind === "enumConstant") {
        return 4;
    }

    if (kind === "field") {
        return 5;
    }

    if (kind === "method") {
        return 6;
    }

    return 7;
}

const compareEntities = (a: Entity, b: Entity) => {
    if (a.kind === b.kind) {
        return a.shortName.localeCompare(b.shortName);
    }

    return entityKindNum(a.kind) - entityKindNum(b.kind);
}

const depthFirstSort = (siblings: readonly Entity[]): Entity[] => {
    const sorted = [...siblings];
    sorted.sort(compareEntities);
    return _.flatMap(sorted, s => [s, ...depthFirstSort(s.children)]);
}

export const sortEntities = (entities: readonly Entity[]) => {
    let files = _.uniqBy(entities.map(e => e.file), f => f.id);
    const sorted = depthFirstSort(files);
    return sorted.filter(s => entities.includes(s));
}

export const commonCommits = (changes: readonly Change[], a: Entity, b: Entity) => {
    const aChanges = changes.filter(c => c.entity === a).map(c => c.commitHash);
    const bChanges = changes.filter(c => c.entity === b).map(c => c.commitHash);
    return _.intersection(aChanges, bChanges);
}