import { sum, map, zip } from "lodash";
import IncompatibleVectorError from "./IncompatibleVectorError";
import Vector from "./Vector";

export default function (a: Vector<boolean>, b: Vector<boolean>) {
    if (a.dim !== b.dim) {
        throw new IncompatibleVectorError();
    }

    return sum(map(zip(a.toArray(), b.toArray()), ([x, y]) => x === y ? 0 : 1));
}