import Change from "./Change";
import Dep from "./Dep";
import Entity from "./Entity";

export default interface Repo {
    readonly id: number;
    readonly name: string;
    readonly githubUrl: string;
    readonly leadRef: string;
    readonly entities: readonly Entity[];
    readonly deps: readonly Dep[];
    readonly changes: readonly Change[];
}