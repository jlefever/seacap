import React from "react";
import AvgLinker from "../../clustering/ahc/AvgLinker";
import Clusterer from "../../clustering/ahc/Clusterer";
import HammingDistFn from "../../clustering/ahc/HammingDistFn";
import MaxLinker from "../../clustering/ahc/MaxLinker";
import MinLinker from "../../clustering/ahc/MinLinker";
import TaggedVector from "../../clustering/ahc/TaggedVector";
import { EntityCluster, preprocess } from "../../clustering/preprocessors";
import Dep from "../../models/Dep";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import FileDropdown from "./FileDropdown";
import FileNotice from "./FileNotice";

export interface ClusterFormProps {
    repo: Repo;
    onCluster: (cluster: EntityCluster) => void;
}

interface ClusterFormState {
    filename: string;
    bubbleTargets: boolean;
    bubbleSources: boolean;
    filterTargets: "all" | "only-leaves";
    filterSources: "all" | "only-leaves" | "only-files";
    filterDep: "all" | "only-external" | "only-internal";
    linkage: "max" | "min" | "avg";
}

function getAllowFn(kind: "all" | "only-leaves" | "only-files") {
    if (kind === "only-leaves") {
        return (e: Entity) => e.isLeaf;
    }

    if (kind === "only-files") {
        return (e: Entity) => e.isRoot;
    }

    return (_: Entity) => true;
}

function getAllowDep(kind: "all" | "only-external" | "only-internal") {
    if (kind === "only-external") {
        return (d: Dep) => d.source.file.id !== d.target.file.id;
    }

    if (kind === "only-internal") {
        return (d: Dep) => d.source.file.id === d.target.file.id;
    }

    return (_: Dep) => true;
}

function getLinker(kind: "max" | "min" | "avg") {
    if (kind === "max") {
        return new MaxLinker(HammingDistFn);
    }

    if (kind === "min") {
        return new MinLinker(HammingDistFn);
    }

    return new AvgLinker(HammingDistFn);
}


export default class ClusterForm extends React.Component<ClusterFormProps, ClusterFormState> {
    constructor(props: ClusterFormProps) {
        super(props);
        this.state = { filename: "", bubbleTargets: false, bubbleSources: true, filterTargets: "only-leaves", filterSources: "all", filterDep: "only-external", linkage: "avg" };

        this.cluster = this.cluster.bind(this);
    }

    cluster() {
        const { filename, bubbleTargets, bubbleSources, filterTargets, filterSources, filterDep, linkage } = this.state;

        const options = {
            filename: filename,
            bubbleTargets: bubbleTargets,
            bubbleSources: bubbleSources,
            allowTarget: getAllowFn(filterTargets),
            allowSource: getAllowFn(filterSources),
            allowDep: getAllowDep(filterDep)
        };

        const vectors = preprocess(this.props.repo.deps, options);
        const cluster = new Clusterer<boolean, TaggedVector<boolean, Entity>>(getLinker(linkage)).cluster(vectors);
        this.props.onCluster(cluster);
    }

    override render() {
        const { repo } = this.props;

        return <form className="form">
            <div className="columns">
                <div className="column">
                    <div className="field">
                        <label className="label">Target File</label>
                        <div className="control">
                            <FileDropdown repo={repo} onSelect={filename => this.setState({ filename })} />
                        </div>
                    </div>
                    <FileNotice repo={repo} filename={this.state.filename} />
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="field">
                        <label className="label">Target Entities</label>
                        <div className="control">
                            <span className="select is-fullwidth">
                                {/* @ts-ignore */}
                                <select onChange={e => this.setState({ filterTargets: e.target.value })} value={this.state.filterTargets}>
                                    <option value="all">All Entities</option>
                                    <option value="only-leaves">Only Leaves</option>
                                </select>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="field">
                        <label className="label is-invisible">Bubble Target Entities</label>
                        <span className="select is-fullwidth">
                            <select
                                onChange={e => this.setState({ bubbleTargets: e.target.value === "true" })}
                                value={"" + this.state.bubbleTargets}
                                disabled={this.state.filterTargets === "only-leaves"}>
                                <option value="true">Bubble Up</option>
                                <option value="false">Don't Bubble Up</option>
                            </select>
                        </span>
                    </div>
                </div>
                <div className="column">
                    <div className="field">
                        <label className="label">Source Entities</label>
                        <div className="control">
                            <span className="select is-fullwidth">
                                {/* @ts-ignore */}
                                <select onChange={e => this.setState({ filterSources: e.target.value })} value={this.state.filterSources}>
                                    <option value="all">All Entities</option>
                                    <option value="only-leaves">Only Leaves</option>
                                    <option value="only-files">Only Files</option>
                                </select>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="field">
                        <label className="label is-invisible">Bubble Source Entities</label>
                        <div className="control">
                            <span className="select is-fullwidth">
                            <select
                                onChange={e => this.setState({ bubbleSources: e.target.value === "true" })}
                                value={"" + this.state.bubbleSources}
                                disabled={this.state.filterSources === "only-leaves"}>
                                <option value="true">Bubble Up</option>
                                <option value="false">Don't Bubble Up</option>
                            </select>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="field">
                        <label className="label">Boundaries</label>
                        <div className="control">
                            <span className="select is-fullwidth">
                            {/* @ts-ignore  */}
                            <select onChange={e => this.setState({ filterDep: e.target.value })} value={this.state.filterDep}>
                                <option value="all">All Dependencies</option>
                                <option value="only-external">Only External</option>
                                <option value="only-internal">Only Internal</option>
                            </select>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="field">
                        <label className="label">Linkage</label>
                        <div className="control">
                            <span className="select is-fullwidth">
                                {/* @ts-ignore */}
                                <select onChange={e => this.setState({ linkage: e.target.value })} value={this.state.linkage}>
                                    <option value="max">Max (Complete-linkage)</option>
                                    <option value="min">Min (Single-linkage)</option>
                                    <option value="avg">Avg (UPGMA)</option>
                                </select>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <button type="button" onClick={_ => this.cluster()} className="button is-fullwidth is-primary">Cluster</button>
                </div>
            </div>
        </form>
    }
}