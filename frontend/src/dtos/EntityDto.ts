export type EntityKind =
    "annotation" |
    "class" |
    "enum" |
    "field" |
    "file" |
    "interface" |
    "method";

export default interface EntityDto {
    id: number;
    parentId?: number;
    name: string;
    kind: EntityKind;
    fromLineno?: number;
    toLineno?: number;
};