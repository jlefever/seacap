import { Entity } from "./Entity";

export default class Change {
    private readonly _id: number;
    private readonly _commitHash: string;
    private readonly _entity: Entity;
    private readonly _churn: number;

    constructor(id: number, commitHash: string, entity: Entity, churn: number) {
        this._id = id;
        this._commitHash = commitHash;
        this._entity = entity;
        this._churn = churn;
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

    public get churn() {
        return this._churn;
    }
}