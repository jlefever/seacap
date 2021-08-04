import React from "react";

import "bulma/css/bulma.css";
import Client from "../Client";
import CrsDto from "../dtos/CrsDto";
import Breadcrumb from "./Breadcrumb";
import RepoDto from "../dtos/RepoDto";
import GithubLink from "./GithubLink";
import { createChanges, createDeps, createEntities, isM2m } from "../util";
import EntityDiv from "./EntityDiv";
import _ from "lodash";

export interface CrsDashProps {
    repoName: string;
    num: number;
};

interface CrsDashState {
    repo?: RepoDto;
    crs?: CrsDto;
}

export default class CrsDash extends React.Component<CrsDashProps, CrsDashState> {
    constructor(props: CrsDashProps) {
        super(props);
        this.state = {};
    }

    override componentDidMount() {
        const client = new Client();
        client.getRepo(this.props.repoName).then(repo => this.setState({ repo }));
        client.getCrs(this.props.repoName, this.props.num).then(crs => this.setState({ crs }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { crs, repo } = this.state;
        const name = `crossing-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{ name: "home", url: "/" }, { name: repoName, url: `/${repoName}` }]} current={name} />
        </>;

        if (!crs || !repo) {
            return <>{header}<span>Loading...</span></>;
        }

        const { summary: sum } = crs;

        const entities = createEntities(crs.entities);
        const changes = createChanges(entities, crs.changes);
        const inDeps = createDeps(entities, crs.inDeps);
        const evoInDeps = createDeps(entities, crs.evoInDeps);
        const outDeps = createDeps(entities, crs.outDeps);
        const evoOutDeps = createDeps(entities, crs.evoOutDeps);

        // console.log(entities);
        // console.log(inDeps);
        // console.log(outDeps);

        console.log(evoOutDeps.filter(isM2m));

        const grouped = _.groupBy(evoOutDeps.filter(isM2m), d => d.source.id);
        console.log(grouped);

        const evoInFiles = [...new Set(evoInDeps.map(d => d.source.file))];
        const evoOutFiles = [...new Set(evoOutDeps.map(d => d.target.file))];

        const callMethods = _.groupBy(evoOutDeps.filter(isM2m), d => d.source.id);
        const calledByMethods = _.groupBy(evoInDeps.filter(isM2m), d => d.target.id);

        return <>
            {header}
            <h2 className="title is-4">Description</h2>
            <div className="content">
                The file <strong><GithubLink path={sum.center} repo={repo} /></strong> depends on <strong>{sum.fanout}</strong> files and has co-changed at least twice with <strong>{sum.evoFanout}</strong> of them. Additionally, this file is depended on by <strong>{sum.fanin}</strong> files and has co-changed at least twice with <strong>{sum.evoFanin}</strong> of them. So this is a crossing with a total of <strong>{sum.size}</strong> files.
            </div>

            <div className="columns">
                <div className="column">
                    <h2 className="title is-6"><abbr title="evolutionarily coupled (co-changed at least twice)">Evo.</abbr> Outgoing Files</h2>
                    <ul>{evoOutFiles.map(f => <li key={f.id}><GithubLink path={f.name} repo={repo} /></li>)}</ul>
                </div>
                <div className="column">
                    <h2 className="title is-6"><abbr title="evolutionarily coupled (co-changed at least twice)">Evo.</abbr> Incoming Files</h2>
                    <ul>{evoInFiles.map(f => <li key={f.id}><GithubLink path={f.name} repo={repo} /></li>)}</ul>
                </div>
            </div>

            <h2 className="title is-4">Concentration</h2>
            <div className="content">
                This center file has <strong>X</strong> methods, <strong>Y</strong> of which <em>call</em> or are <em>called by</em> a method in a file which is evolutionarily coupled with the center file.
            </div>
            <div className="columns">
                <div className="column">
                    <h2 className="title is-6">Outgoing Calls</h2>
                    <ul>{Object.entries(callMethods).map(e => <li key={e[0]}>{entities.get(parseInt(e[0]))?.name} <span>(calls <strong>{e[1].length}</strong> methods)</span></li>)}</ul>
                </div>
                <div className="column">
                    <h2 className="title is-6">Incoming Calls</h2>
                    <ul>{Object.entries(calledByMethods).map(e => <li key={e[0]}>{entities.get(parseInt(e[0]))?.name} <span>(called by <strong>{e[1].length}</strong> methods)</span></li>)}</ul>
                </div>
            </div>

            <h2 className="title is-4">Alignment</h2>
            <div className="content">
                The following method-to-method dependencies have co-changed at least once. Or in other words, these dependencies are structurally and historically aligned with the file-level crossing.
            </div>
            <div className="columns">
                <div className="column">
                    <h2 className="title is-6">Outgoing Calls</h2>
                    <ul>
                        {evoOutDeps.filter(isM2m).map(d => (
                            <li>
                                {d.source.name}
                                <span className="icon"><i className="fas fa-arrow-right"></i></span>
                                {d.target.name} (co-changed <strong>{d.source.cocommits(d.target).length}</strong> times)
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="column">
                    <h2 className="title is-6">Incoming Calls</h2>
                    <ul>
                        {evoInDeps.filter(isM2m).map(d => (
                            <li>
                                {d.source.name}
                                <span className="icon"><i className="fas fa-arrow-right"></i></span>
                                {d.target.name} (co-changed <strong>{d.source.cocommits(d.target).length}</strong> times)
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>;
    }
}