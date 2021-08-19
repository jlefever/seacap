export type DepKind =
    "annotation" |
    "call" |
    "cast" |
    "contain" |
    "create" |
    "extend" |
    "implement" |
    "parameter" |
    "return" |
    "use";

export default interface DepDto {
    id: number;
    sourceId: number;
    targetId: number;
    weight: number;
    kind: DepKind;
};