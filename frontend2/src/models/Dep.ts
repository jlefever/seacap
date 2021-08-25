import Entity from "./Entity";

export default interface Dep {
    source: Entity;
    target: Entity;
    kind: string;
}