import _ from "lodash";
import Change from "../models/Change";
import Dep from "../models/Dep";
import Entity from "../models/Entity";

export interface PreprocessDepsOptions {
    filename: string;
    bubbleTargets: boolean;
    bubbleSources: boolean;
    allowTarget: (e: Entity) => boolean;
    allowSource: (e: Entity) => boolean;
    allowDep: (d: Dep) => boolean;
}

export function preprocessDeps(deps: readonly Dep[], opts: PreprocessDepsOptions) {
    let selected = selectDeps(deps, opts.filename);
    selected = selected.filter(d => opts.allowDep(d));
    selected = opts.bubbleSources ? bubbleSources(selected) : selected;
    selected = opts.bubbleTargets ? bubbleTargets(selected) : selected;
    selected = selected.filter(d => opts.allowSource(d.source));
    selected = selected.filter(d => opts.allowTarget(d.target));
    return selected;
}

export function preprocessChanges(deps: readonly Dep[], changes: readonly Change[]) {
    const entities = _.union(deps.map(d => d.source), deps.map(d => d.target));
    return changes.filter(c => entities.includes(c.entity));
}

export function onlySourceChanges(deps: readonly Dep[], changes: readonly Change[]) {
    const sources = deps.map(d => d.source);
    return changes.filter(c => sources.includes(c.entity));
}

export function onlyTargetChanges(deps: readonly Dep[], changes: readonly Change[]) {
    const targets = deps.map(d => d.target);
    return changes.filter(c => targets.includes(c.entity));
}

function selectDeps(deps: readonly Dep[], targetFile: string) {
    return deps.filter(d => d.target.file.name === targetFile);
}

function bubbleSource(dep: Dep): Dep[] {
    return dep.source.ancestory.map(source => ({ source: source, kind: dep.kind, target: dep.target }));
}

function bubbleSources(deps: Dep[]): Dep[] {
    return deps.map(d => bubbleSource(d)).reduce((acc, cur) => acc.concat(cur));
}

function bubbleTarget(dep: Dep): Dep[] {
    return dep.target.ancestory.map(target => ({ source: dep.source, kind: dep.kind, target: target }));
}

function bubbleTargets(deps: Dep[]): Dep[] {
    return deps.map(d => bubbleTarget(d)).reduce((acc, cur) => acc.concat(cur));
}