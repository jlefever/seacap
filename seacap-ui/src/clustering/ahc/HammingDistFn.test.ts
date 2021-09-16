import HammingDistFn from "./HammingDistFn";
import ArrVector from "./ArrVector";

test("should be 3", () => {
    expect(HammingDistFn(
        new ArrVector([false, false, false]), 
        new ArrVector([true, true, true])
    )).toBe(3);
});

test("should be 1", () => {
    expect(HammingDistFn(
        new ArrVector([false, true, true]), 
        new ArrVector([true, true, true])
    )).toBe(1);
});

test("should be 0", () => {
    expect(HammingDistFn(
        new ArrVector([true, true, true]), 
        new ArrVector([true, true, true])
    )).toBe(0);
});
