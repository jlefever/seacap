import Edge from "../base/graph/Edge";
import Entity from "./Entity";

export default interface Dep extends Edge<Entity, Entity> {
    source: Entity;
    target: Entity;
    kind: string;
}