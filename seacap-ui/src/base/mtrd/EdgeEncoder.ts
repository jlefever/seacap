import Edge from "../graph/Edge";

export interface EdgeEncoder<S, T, E extends Edge<S, T>> {
    encode(edge: E): number;
}