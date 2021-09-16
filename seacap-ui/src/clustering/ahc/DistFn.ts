import Vector from "./Vector";

type DistFn<T> = (a: Vector<T>, b: Vector<T>) => number;

export default DistFn;