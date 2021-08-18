import EntityDto from "../dtos/EntityDto";
import { getShortFilename } from "../util";
import Change from "./Change";

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

    get exists() {
        return !(this._dto.fromLineno === undefined || this._dto.fromLineno === null);
    }

    get linenos(): [number, number] | null {
        if (!this.exists) {
            return null;
        }

        return [this._dto.fromLineno!, this._dto.toLineno!];
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

    get displayName(): string {
        if (this.kind === "file") {
            return this.name;
        }

        return this.ancestory.map(e => {
            if (e.kind === "file") {
                return getShortFilename(e.name);
            }

            return `${e.name} [${e.kind[0]}]`;
        }).join(" > ");
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