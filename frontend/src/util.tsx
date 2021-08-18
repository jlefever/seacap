import Dep from "./models/Dep";

export function getShortFilename(path: string) {
    const arr = path.split("/");
    return arr[arr.length - 1];
}

export function isM2m(dep: Dep) {
    return dep.source.kind === "method" && dep.target.kind === "method";
}
