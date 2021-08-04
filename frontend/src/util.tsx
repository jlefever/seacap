import ChangeDto from "./dtos/ChangeDto";
import DepDto from "./dtos/DepDto";
import EntityDto from "./dtos/EntityDto";

export class Entity {
    private readonly _dto: EntityDto;
    private readonly _children: Entity[];
    private readonly _changes: Change[];
    private _parent: Entity | null;

    constructor(dto: EntityDto) {
        this._dto = dto;
        this._children = [];
        this._changes = [];
        this._parent = null;
    }

    get dto() {
        return this._dto;
    }

    get id() {
        return this._dto.id;
    }

    get name() {
        return this._dto.name;
    }

    get kind() {
        return this._dto.kind;
    }

    get parent() {
        return this._parent;
    }

    get children(): readonly Entity[] {
        return this._children;
    }

    get changes(): readonly Change[] {
        return this._changes;
    }

    get file(): Entity {
        if (this.parent === null) {
            return this;
        }

        return this.parent.file;
    }

    get ancestory(): Entity[] {
        if (this.parent === null) {
            return [this];
        }

        const arr = this.parent.ancestory;
        arr.push(this);
        return arr;
    }

    cocommits = (other: Entity) => {
        const myCommits = this.changes.map(c => c.commitHash);
        const otherCommits = other.changes.map(c => c.commitHash);
        return new Array(new Set(myCommits.concat(otherCommits)));
    };

    setParent = (value: Entity) => {
        if (this.parent != null) {
            const idx = this.parent._children.findIndex(c => c == this);
            this.parent._children.splice(idx, 1);
            console.log("removing parent");
        }

        this._parent = value;
        this._parent._children.push(this);
    };

    addChange = (value: Change) => {
        this._changes.push(value);
    };
}

export class Change {
    private readonly _id: number;
    private readonly _commitHash: string;
    private readonly _entity: Entity;

    constructor(id: number, commitHash: string, entity: Entity) {
        this._id = id;
        this._commitHash = commitHash;
        this._entity = entity;
    }

    public get id() {
        return this._id;
    }

    public get commitHash() {
        return this._commitHash;
    }

    public get entity() {
        return this._entity;
    }
}

export class Dep {
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
    dtos.map(dto => changes.set(dto.id, new Change(dto.id, dto.commitHash, entities.get(dto.entityId)!)));
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

export function isM2m(dep: Dep) {
    return dep.source.kind === "method" && dep.target.kind === "method";
}

// interface Commit {
//     hash: string;
//     changes: readonly Change[];
// };



// interface Change {
//     id: number;
//     commitHash: string;
//     entity: Entity;
// };