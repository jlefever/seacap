import _ from "lodash";
import HashDict from "../base/dict/HashDict";
import Dep from "../models/Dep";
import Entity from "../models/Entity";
import ArrVector from "./ahc/ArrVector";
import Cluster from "./ahc/Cluster";
import TaggedVector from "./ahc/TaggedVector";

export type EntityCluster = Cluster<boolean, TaggedVector<boolean, Entity>>;

export interface PreprocessOptions {
    filename: string;
    bubbleTargets: boolean;
    bubbleSources: boolean;
    allowTarget: (e: Entity) => boolean;
    allowSource: (e: Entity) => boolean;
    allowDep: (d: Dep) => boolean;
}

// function isExternal(dep: Dep) {
//     return dep.source.file.id !== dep.target.file.id;
// }

// function externalDeps(deps: readonly Dep[]) {
//     return deps.filter(d => isExternal(d));
// }

export function preprocess(deps: readonly Dep[], opts: PreprocessOptions) {
    let selected = selectDeps(deps, opts.filename);
    selected = selected.filter(d => opts.allowDep(d));
    selected = opts.bubbleSources ? bubbleSources(selected) : selected;
    selected = opts.bubbleTargets ? bubbleTargets(selected) : selected;
    selected = selected.filter(d => opts.allowSource(d.source));
    selected = selected.filter(d => opts.allowTarget(d.target));
    return selected;
}

export function selectDeps(deps: readonly Dep[], targetFile: string) {
    return deps.filter(d => d.target.file.name === targetFile);
}

function bubbleSource(dep: Dep): Dep[] {
    return dep.source.ancestory.map(source => ({ source: source, kind: dep.kind, target: dep.target }));
}

export function bubbleSources(deps: Dep[]): Dep[] {
    return deps.map(d => bubbleSource(d)).reduce((acc, cur) => acc.concat(cur));
}

function bubbleTarget(dep: Dep): Dep[] {
    return dep.target.ancestory.map(target => ({ source: dep.source, kind: dep.kind, target: target }));
}

export function bubbleTargets(deps: Dep[]): Dep[] {
    return deps.map(d => bubbleTarget(d)).reduce((acc, cur) => acc.concat(cur));
}

export function onlyRootTargets(deps: Dep[]) {
    return deps.filter(d => d.target.isRoot);
}

export function onlyLeafTargets(deps: Dep[]) {
    return deps.filter(d => d.target.isLeaf);
}

export function onlyRootSources(deps: Dep[]) {
    return deps.filter(d => d.source.isRoot);
}

export function onlyLeafSources(deps: Dep[]) {
    return deps.filter(d => d.source.isLeaf);
}

export function vectorize(deps: Dep[]): TaggedVector<boolean, Entity>[] {
    const sourceIds = Array.from(new Set(deps.map(d => d.source.id)));

    // console.log(deps);

    return HashDict.groupBy(deps, d => d.target).pairs().map(([entity, ds]) => new TaggedVector(
        new ArrVector(or(ds.map(d => toVector(d, sourceIds)))),
        entity
    ));
}

function toVector(dep: Dep, sourceIds: readonly number[]) {
    const vec = _.fill(Array(sourceIds.length), false);
    vec[sourceIds.indexOf(dep.source.id)] = true;
    return vec;
}

function or(vecs: boolean[][]) {
    return vecs.reduce((acc, cur) => _.map(_.zip(acc, cur), ([x, y]) => valueOf(x) || valueOf(y)));
}

function valueOf<T>(x: T | undefined | null): T {
    if (x === undefined || x === null) {
        throw new Error("missing value");
    }

    return x;
}