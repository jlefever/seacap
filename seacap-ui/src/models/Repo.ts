import Change from "./Change";
import Dep from "./Dep";
import Entity from "./Entity";

export default interface Repo {
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly gitWeb: string;
    readonly gitLeadRef: string;
    readonly entities: readonly Entity[];
    readonly deps: readonly Dep[];
    readonly changes: readonly Change[];
}