import Hashable from "../Hashable";

export default interface Dict<K extends Hashable, V> {
    get(key: K): V | undefined;
    getOrSet(key: K, getValue: (key?: K) => V): V;
    getOrDefault(key: K, getDefault: (key?: K) => V): V;
    set(key: K, value: V): Dict<K, V>;
    keys(): K[];
    values(): V[];
    pairs(): readonly [key: K, value: V][];
    map<T>(fn: (k: K, v: V) => T): Dict<K, T>;
    mapEntries<T>(fn: (k: K, v: V) => T): T[];
}