import Hashable from "../Hashable";
import Edge from "./Edge";

/**
 * A multi-set of directed edges from `S` to `T`. May contain many edges between any two vertices.
 */
export default interface EdgeBag<S extends Hashable, T extends Hashable, E extends Edge<S, T>> {
    edges: readonly E[];
    vertices: readonly (S | T)[];

    sources: readonly S[];
    targets: readonly T[];

    outgoing(source: S): readonly T[];
    incoming(target: T): readonly S[];

    outgoingEdges(source: S): readonly E[];
    incomingEdges(source: T): readonly E[];

    between(source: S, target: T): readonly E[];
}
