import BiCluster from "./BiCluster";
import Cluster from "./Cluster";
import Linker from "./Linker";
import Singleton from "./Singleton";
import Vector from "./Vector";

export default class Clusterer<T, V extends Vector<T>> {
    private readonly _linker: Linker<T, V>;

    constructor(linker: Linker<T, V>) {
        this._linker = linker;
    }

    cluster(vectors: readonly V[]): Cluster<T, V> {
        const clusters: Cluster<T, V>[] = vectors.map(Singleton.wrap);

        while (clusters.length > 1) {
            let minDist = Number.POSITIVE_INFINITY;
            let minPair = [-1, -1];

            for (let i = 0; i < clusters.length; i++) {
                for (let j = i + 1; j < clusters.length; j++) {
                    const d = this._linker.dist(clusters[i], clusters[j]);

                    if (d >= minDist) {
                        continue;
                    }

                    minDist = d;
                    minPair = [i, j];
                }
            }

            const merged = BiCluster.merge(clusters[minPair[0]], clusters[minPair[1]]);

            clusters.splice(Math.max(...minPair), 1);
            clusters.splice(Math.min(...minPair), 1);
            clusters.push(merged);
        }

        return clusters[0];
    }
}