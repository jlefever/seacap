import _ from "lodash";
import React from "react";
import { Dropdown } from "semantic-ui-react";
import { preprocessChanges, preprocessDeps } from "../../base/preprocessors";
import Change from "../../models/Change";
import Dep from "../../models/Dep";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import FileDropdown from "./FileDropdown";
import FileNotice from "./FileNotice";

export interface PreprocessFormProps {
    repo: Repo;
    onSubmit: (deps: Dep[], changes: Change[]) => void;
}

interface PreprocessFormState {
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

export default class PreprocessForm extends React.Component<PreprocessFormProps, PreprocessFormState> {
    constructor(props: PreprocessFormProps) {
        super(props);
        this.state = { filename: "", bubbleTargets: false, bubbleSources: true, filterTargets: "only-leaves", filterSources: "all", filterDep: "only-external", linkage: "avg" };

        this.submit = this.submit.bind(this);
    }

    submit(e?: React.MouseEvent) {
        if (e) {
            e.preventDefault();
        }

        const { filename, bubbleTargets, bubbleSources, filterTargets, filterSources, filterDep, linkage } = this.state;

        const options = {
            filename: filename,
            bubbleTargets: bubbleTargets,
            bubbleSources: bubbleSources,
            allowTarget: getAllowFn(filterTargets),
            allowSource: getAllowFn(filterSources),
            allowDep: getAllowDep(filterDep)
        };

        const { repo } = this.props;
        const deps = preprocessDeps(repo.deps, options);
        const changes = preprocessChanges(deps, repo.changes);

        this.props.onSubmit(deps, changes);
    }

    override render() {
        const { repo } = this.props;

        return <form className="ui form">
            <div className="field">
                <label>Interface File</label>
                <FileDropdown repo={repo} onSelect={filename => this.setState({ filename })} />
                <FileNotice repo={repo} filename={this.state.filename} />
            </div>
            <div className="fields">
                <div className="six wide field">
                    <label>Interface Entities</label>
                    <div className="two fields">
                        <div className="field">
                            <Dropdown fluid selection
                                // @ts-ignore
                                onChange={(_, p) => this.setState({ filterTargets: p.value })}
                                value={this.state.filterTargets}
                                options={[
                                    { value: "all", text: "All Entities" },
                                    { value: "only-leaves", text: "Only Leaves" },
                                ]} />
                        </div>
                        <div className="field">
                            <Dropdown fluid selection
                                onChange={(_, p) => this.setState({ bubbleTargets: p.value === "true" })}
                                value={"" + this.state.bubbleTargets}
                                disabled={this.state.filterTargets === "only-leaves"}
                                options={[
                                    { value: "true", text: "Bubble" },
                                    { value: "false", text: "No Bubble" },
                                ]} />
                        </div>
                    </div>
                </div>
                <div className="six wide field">
                    <label>Client Entities</label>
                    <div className="two fields">
                        <div className="field">
                            <Dropdown fluid selection
                                // @ts-ignore
                                onChange={(_, p) => this.setState({ filterSources: p.value })}
                                value={this.state.filterSources}
                                options={[
                                    { value: "all", text: "All Entities" },
                                    { value: "only-leaves", text: "Only Leaves" },
                                    { value: "only-files", text: "Only Files" },
                                ]} />
                        </div>
                        <div className="field">
                            <Dropdown fluid selection
                                onChange={(_, p) => this.setState({ bubbleSources: p.value === "true" })}
                                value={"" + this.state.bubbleSources}
                                disabled={this.state.filterSources === "only-leaves"}
                                options={[
                                    { value: "true", text: "Bubble" },
                                    { value: "false", text: "No Bubble" },
                                ]} />
                        </div>
                    </div>
                </div>
                <div className="four wide field">
                    <label>Boundaries</label>
                    <div className="two fields">
                        <div className="field">
                            <Dropdown fluid selection
                                // @ts-ignore
                                onChange={(_, p) => this.setState({ filterDep: p.value })}
                                value={this.state.filterDep}
                                options={[
                                    { value: "all", text: "All" },
                                    { value: "only-external", text: "External" },
                                    { value: "only-internal", text: "Internal" }
                                ]} />
                        </div>
                        <div className="field">
                            <button className="ui fluid violet button" type="submit" onClick={this.submit}>Update</button>
                        </div>
                    </div>

                </div>
            </div>
            {/* <button className="ui fluid button" type="submit" onClick={this.submit}>Submit</button> */}
        </form>
    }
}