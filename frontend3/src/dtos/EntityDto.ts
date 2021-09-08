export default interface EntityDto {
    id: number;
    parentId?: number;
    name: string;
    kind: string;
    fromLineno?: number;
    toLineno?: number;
};