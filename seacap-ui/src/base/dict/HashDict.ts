import Dict from "./Dict";
import Hashable from "../Hashable";
import HashableObject from "../HashableObject";

export default class HashDict<K extends Hashable, V> implements Dict<K, V> {
    private readonly _keys: Map<string, K>;
    private readonly _values: Map<string, V>;

    constructor() {
        this._keys = new Map<string, K>();
        this._values = new Map<string, V>();
    }

    public static fromList<K extends Hashable, V>(assoc: [key: K, value: V][]) {
        const dict = new HashDict<K, V>();
        assoc.forEach(([k, v]) => dict.setOrError(k, v));
        return dict;
    }

    public static groupBy<K extends Hashable, V>(values: readonly V[], getKey: (value: V) => K): Dict<K, V[]> {
        const dict = new HashDict<K, V[]>();
        values.forEach(value => dict.getOrSet(getKey(value), () => []).push(value));
        return dict;
    }

    private isPrimitiveKey(key: K) {
        return typeof key === "string" || typeof key === "number";
    }

    public has(key: K) {
        if (this.isPrimitiveKey(key)) {
            return this._values.has(key.toString());
        }

        return this._values.has((key as HashableObject).hash());
    }

    public get(key: K): V | undefined {
        if (this.isPrimitiveKey(key)) {
            return this._values.get(key.toString());
        }

        return this._values.get((key as HashableObject).hash());
    }

    public getOrSet(key: K, getValue: (key?: K) => V) {
        let value = this.get(key);

        if (value === undefined) {
            value = getValue(key);
            this.set(key, value);
        }

        return value;
    }

    public getOrDefault(key: K, getDefault: (key?: K) => V) {
        const value = this.get(key);
        return value ? value : getDefault(key);
    }

    public set(key: K, value: V) {
        const hash = this.isPrimitiveKey(key) ? key.toString() : (key as HashableObject).hash();
        this._keys.set(hash, key);
        this._values.set(hash, value);
        return this;
    }

    public setOrError(key: K, value: V) {
        if (this.has(key)) {
            throw new Error("Key already set.");
        }

        this.set(key, value);
    }

    public keys(): K[] {
        return Array.from(this._keys.values());
    }

    public values(): V[] {
        return Array.from(this._values.values());
    }

    public pairs(): [key: K, value: V][] {
        return this.mapEntries((k, v) => [k, v]);
    }

    public map<T>(fn: (k: K, v: V) => T): Dict<K, T> {
        return HashDict.fromList(this.mapEntries((k, v) => [k, fn(k, v)]));
    }

    public mapEntries<T>(fn: (k: K, v: V) => T): T[] {
        return Array.from(this._values.entries()).map(([hash, value]) => fn(this._keys.get(hash)!, value));
    }
}