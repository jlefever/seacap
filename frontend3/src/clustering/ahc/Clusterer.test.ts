import HammingDistFn from "./HammingDistFn";
import MaxLinker from "./MaxLinker";
import Clusterer from "./Clusterer";
import ArrVector from "./ArrVector";

test("cluster n=3, d=3", () => {
    const linker = new MaxLinker(HammingDistFn);
    var clusterer = new Clusterer(linker);

    const root = clusterer.cluster([
        new ArrVector([true, true, true]),
        new ArrVector([true, true, false]),
        new ArrVector([false, false, false]),
    ]);

    console.log(root);
});