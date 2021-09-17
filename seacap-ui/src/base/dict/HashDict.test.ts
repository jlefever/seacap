import HashableObject from "../HashableObject";
import objectHash from "object-hash";
import HashDict from "./HashDict";

class Foo implements HashableObject {
    readonly num: number;
    readonly str: string;

    constructor(num: number, str: string) {
        this.num = num;
        this.str = str;
    }

    hash() {
        return objectHash(this);
    }
}

const foo1 = new Foo(10, "foo");
const foo2 = new Foo(10, "foo");
const foo3 = new Foo(12, "bar");

test("constructor", () => {
    expect(() => new HashDict()).not.toThrowError();
});

test("set", () => {
    const dict = new HashDict<Foo, string>();
    dict.set(foo1, "FOO");
    expect(dict.get(foo1)).toEqual("FOO");
    dict.set(foo1, "BOO");
    expect(dict.get(foo1)).toEqual("BOO");
    dict.set(foo2, "POO");
    expect(dict.get(foo1)).toEqual("POO");
});

test("get", () => {
    const dict = new HashDict<Foo, string>();
    dict.set(foo1, "FOO");
    expect(dict.get(foo1)).toEqual("FOO");
    expect(dict.get(foo2)).toEqual("FOO");
    expect(dict.get(foo3)).toEqual(undefined);
});