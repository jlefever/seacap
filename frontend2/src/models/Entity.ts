import LineRange from "./LineRange";

export default interface Entity {
    readonly id: number;
    readonly name: string;
    readonly kind: string;
    readonly exists: boolean;
    readonly linenos: LineRange | null;
    readonly parent: Entity | null;
    readonly file: Entity;
    readonly ancestory: readonly Entity[];
    readonly children: readonly Entity[];
}
