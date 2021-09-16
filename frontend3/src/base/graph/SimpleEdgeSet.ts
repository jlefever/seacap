import Hashable from "../Hashable";

export default interface SimpleEdgeSet<S extends Hashable, T extends Hashable> {
    readonly sources: readonly S[];
    readonly targets: readonly T[];
    targetsOf(source: S): readonly T[];
    sourcesOf(target: T): readonly S[];
}
