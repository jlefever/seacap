import Cluster from "./Cluster";
import DistFn from "./DistFn";
import Linker from "./Linker";
import Vector from "./Vector";

export default class MinLinker<T, V extends Vector<T>> implements Linker<T, V> {
    private readonly _dist: DistFn<T>;

    constructor(dist: DistFn<T>) {
        this._dist = dist;
    }

    dist(a: Cluster<T, V>, b: Cluster<T, V>) {
        let minDist = 0;

        const outer = a.toArray();
        const inner = b.toArray();

        for(let i = 0; i < outer.length; i++) {
            for(let j = 0; j < inner.length; j++) {
                const d = this._dist(outer[i], inner[j]);

                if (d >= minDist) {
                    continue;
                }
                
                minDist = d;
            }
        }

        return minDist;
    }
}