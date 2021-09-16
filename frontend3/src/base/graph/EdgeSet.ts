import Hashable from "../Hashable";
import Edge from "./Edge";
import SimpleEdgeSet from "./SimpleEdgeSet";

export default interface EdgeSet<S extends Hashable, T extends Hashable, E extends Edge<S, T>> extends SimpleEdgeSet<S, T> {
    readonly edges: readonly E[];
}
