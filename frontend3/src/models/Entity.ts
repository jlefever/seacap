import Hashable from "../collections/Hashable";
import LineRange from "./LineRange";

export default interface Entity extends Hashable {
    readonly id: number;
    readonly name: string;
    readonly kind: string;
    readonly exists: boolean;
    readonly linenos: LineRange | null;
    readonly parent: Entity | null;
    readonly file: Entity;
    readonly ancestory: readonly Entity[];
    readonly children: readonly Entity[];
    readonly isRoot: boolean;
    readonly isLeaf: boolean;
}
