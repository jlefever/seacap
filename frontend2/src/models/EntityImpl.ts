import Entity from "./Entity";
import LineRange from "./LineRange";

export default class EntityImpl implements Entity {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _kind: string;
    private readonly _linenos: LineRange | null;
    private _parent: EntityImpl | null;
    private _children: EntityImpl[];

    constructor(id: number, name: string, kind: string, linenos: LineRange | null) {
        this._id = id;
        this._name = name;
        this._kind = kind;
        this._linenos = linenos;
        this._parent = null;
        this._children = [];
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get kind(): string {
        return this._kind;
    }

    get parent(): EntityImpl | null {
        return this._parent;
    }

    get exists(): boolean {
        return this._linenos !== undefined;
    }

    get linenos(): LineRange | null {
        return this._linenos;
    }

    get children(): readonly EntityImpl[] {
        return this._children;
    }

    get file(): EntityImpl {
        if (this.parent !== null) {
            return this.parent.file;    
        }

        if (this.kind !== "file") {
            throw new Error("root entity is not a file");
        }

        return this;
    }

    get ancestory(): EntityImpl[] {
        if (this.parent === null) {
            return [this];
        }

        const arr = this.parent.ancestory;
        arr.push(this);
        return arr;
    }

    setParent = (value: EntityImpl) => {
        if (this.parent !== null) {
            const idx = this.parent._children.findIndex(c => c == this);
            this.parent._children.splice(idx, 1);
        }

        this._parent = value;
        this._parent._children.push(this);
    };
}
