import Hashable from "./Hashable";

export type DictKey = Hashable | string | number;

export default interface Dict<K extends DictKey, V> {
    get(key: K): V | undefined;
    getOrDefault(key: K, getDefault: (key?: K) => V): V;
    set(key: K, value: V): Dict<K, V>;
    pairs(): readonly [key: K, value: V][];
}

// class PrimitiveDict<K extends string | number, V> implements Dict<K, V> {
//     private readonly _table: Map<K, V>;

//     constructor() {
//         this._table = new Map<K, V>();
//     }

//     public get(key: K): V | undefined {
//         return this._table.get(key);
//     }

//     public getOrDefault(key: K, def: V) {
//         const value = this.get(key);
//         return value === undefined ? def : value;
//     }

//     public set(key: K, value: V) {
//         this._table.set(key, value);
//         return this;
//     }
// }

export class HashDict<K extends Hashable, V> implements Dict<K, V> {
    private readonly _keys: Map<string, K>;
    private readonly _values: Map<string, V>;

    constructor() {
        this._keys = new Map<string, K>();
        this._values = new Map<string, V>();
    }

    public get(key: K): V | undefined {
        return this._values.get(key.hash());
    }

    public getOrDefault(key: K, getDefault: (key?: K) => V) {
        let value = this.get(key);

        if (value === undefined) {
            value = getDefault(key);
            this.set(key, value);
        }

        return value;
    }

    public set(key: K, value: V) {
        const hash = key.hash();
        this._keys.set(hash, key);
        this._values.set(hash, value);
        return this;
    }

    public pairs(): [key: K, value: V][] {
        return Array.from(this._values.entries()).map(([hash, value]) => [this._keys.get(hash)!, value]);
    }
}

export function groupBy<K extends Hashable, V>(values: readonly V[], getKey: (value: V) => K): Dict<K, V[]> {
    const dict = new HashDict<K, V[]>();

    values.forEach(value => {
        let key = getKey(value);
        let valuesForKey = dict.getOrDefault(key, () => []);
        valuesForKey.push(value);
    });

    return dict;
}