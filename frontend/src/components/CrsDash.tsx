import React from "react";

import "bulma/css/bulma.css";
import Client from "../Client";
import CrsDto from "../dtos/CrsDto";
import Breadcrumb from "./Breadcrumb";
import RepoDto from "../dtos/RepoDto";
import GithubLink from "./GithubLink";
import _ from "lodash";

import KindFilter from "./KindFilter";
import Dep from "../models/Dep";
import { createChanges, createDeps, createEntities } from "../models/builders";
import EntityModalLink from "./EntityModalLink";

export interface CrsDashProps {
    repoName: string;
    num: number;
};

interface CrsDashState {
    repo?: RepoDto;
    crs?: CrsDto;
    entityKinds: string[];
    depKinds: string[];
    allowedEntityKinds: string[];
    allowedDepKinds: string[];
}

export default class CrsDash extends React.Component<CrsDashProps, CrsDashState> {
    constructor(props: CrsDashProps) {
        super(props);
        this.state = { allowedEntityKinds: [], allowedDepKinds: [], entityKinds: [], depKinds: [] };
    }

    override componentDidMount() {
        const client = new Client();
        client.getEntityKinds().then(entityKinds => this.setState({ entityKinds, allowedEntityKinds: entityKinds }));
        client.getDepKinds().then(depKinds => this.setState({ depKinds, allowedDepKinds: depKinds }));
        client.getRepo(this.props.repoName).then(repo => this.setState({ repo }));
        client.getCrs(this.props.repoName, this.props.num).then(crs => this.setState({ crs }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { crs, repo, allowedEntityKinds, allowedDepKinds } = this.state;
        const name = `crossing-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{ name: "home", url: "/" }, { name: repoName, url: `/${repoName}` }]} current={name} />
        </>;

        if (!crs || !repo) {
            return <>{header}<span>Loading...</span></>;
        }

        const { summary: sum } = crs;

        function isAllowedDep(dep: Dep) {
            return allowedEntityKinds.includes(dep.source.kind) && allowedEntityKinds.includes(dep.target.kind);
        }

        function isNonEmpty(dep: Dep) {
            return dep.dtos.length !== 0;
        }

        function filterDtos(dep: Dep) {
            return new Dep(dep.source, dep.target, dep.dtos.filter(d => allowedDepKinds.includes(d.kind)));
        }

        const entities = createEntities(crs.entities);
        const changes = createChanges(entities, crs.changes);
        let inDeps = createDeps(entities, crs.inDeps);
        let evoInDeps = createDeps(entities, crs.evoInDeps);
        let outDeps = createDeps(entities, crs.outDeps);
        let evoOutDeps = createDeps(entities, crs.evoOutDeps);

        inDeps = inDeps.filter(isAllowedDep).map(filterDtos).filter(isNonEmpty);
        evoInDeps = evoInDeps.filter(isAllowedDep).map(filterDtos).filter(isNonEmpty);
        outDeps = outDeps.filter(isAllowedDep).map(filterDtos).filter(isNonEmpty);
        evoOutDeps = evoOutDeps.filter(isAllowedDep).map(filterDtos).filter(isNonEmpty);

        const evoInFiles = [...new Set(evoInDeps.map(d => d.source.file))];
        const evoOutFiles = [...new Set(evoOutDeps.map(d => d.target.file))];

        const evoInEntities = _.groupBy(evoInDeps.filter(isAllowedDep), d => d.target.id);
        const evoOutEntities = _.groupBy(evoOutDeps.filter(isAllowedDep), d => d.source.id);

        return <>
            {header}
            <div className="columns">
                <div className="column">
                    <article className="message">
                        <div className="message-header">
                            <p>Entity Types</p>
                            <span className="icon"><i className="fas fa-sitemap"></i></span>
                        </div>
                        <div className="message-body">
                            <KindFilter kinds={this.state.entityKinds} setSelected={s => this.setState({ allowedEntityKinds: s })} selected={this.state.allowedEntityKinds} />
                        </div>
                    </article>
                    <article className="message">
                        <div className="message-header">
                            <p>Dependency Types</p>
                            <span className="icon"><i className="fas fa-sitemap"></i></span>
                        </div>
                        <div className="message-body">
                            <KindFilter kinds={this.state.depKinds} setSelected={s => this.setState({ allowedDepKinds: s })} selected={this.state.allowedDepKinds} />
                        </div>
                    </article>
                </div>
            </div>

            <h2 className="title is-4">Description</h2>
            <div className="content">
                The file <strong><GithubLink item={sum.center} repo={repo} /></strong> depends on <strong>{sum.fanout}</strong> files and has co-changed at least twice with <strong>{sum.evoFanout}</strong> of them. Additionally, this file is depended on by <strong>{sum.fanin}</strong> files and has co-changed at least twice with <strong>{sum.evoFanin}</strong> of them. So this is a crossing with a total of <strong>{sum.size}</strong> files.
            </div>

            <div className="columns">
                <div className="column">
                    <h2 className="title is-6"><abbr title="evolutionarily coupled (co-changed at least twice)">Evo.</abbr> Incoming Files</h2>
                    <ul>{evoInFiles.map(f => <li key={f.id}><GithubLink item={f.name} repo={repo} /></li>)}</ul>
                </div>
                <div className="column">
                    <h2 className="title is-6"><abbr title="evolutionarily coupled (co-changed at least twice)">Evo.</abbr> Outgoing Files</h2>
                    <ul>{evoOutFiles.map(f => <li key={f.id}><GithubLink item={f.name} repo={repo} /></li>)}</ul>
                </div>
            </div>

            <h2 className="title is-4">Concentration</h2>
            <div className="content">
                This center file has <strong>X</strong> entities, <strong>Y</strong> of which <em>depend</em> or are <em>depended</em> on by a method in a file which is evolutionarily coupled with the center file.
            </div>
            <div className="columns">
                <div className="column">
                    <h2 className="title is-6">Incoming Dependencies</h2>
                    <ul>{Object.entries(evoInEntities).map(e => <li key={e[0]}><GithubLink item={entities.get(parseInt(e[0]))!} repo={repo} /> <span>(depended on by <strong><EntityModalLink entities={e[1].map(d => d.source)} repo={repo} /></strong> entities)</span></li>)}</ul>
                </div>
                <div className="column">
                    <h2 className="title is-6">Outgoing Dependencies</h2>
                    <ul>{Object.entries(evoOutEntities).map(e => <li key={e[0]}><GithubLink item={entities.get(parseInt(e[0]))!} repo={repo} /> <span>(depends on <strong><EntityModalLink entities={e[1].map(d => d.target)} repo={repo} /></strong> entities)</span></li>)}</ul>
                </div>
            </div>

            <h2 className="title is-4">Alignment</h2>
            <div className="content">
                The following method-to-method dependencies have co-changed at least once. Or in other words, these dependencies are structurally and historically aligned with the file-level crossing.
            </div>
            <div className="column">
                <h2 className="title is-6">Incoming Calls</h2>
                <ul>
                    {evoInDeps.filter(isAllowedDep).map(d => (
                        <li>
                            <GithubLink item={d.source} repo={repo} />
                            <span className="icon"><i className="fas fa-arrow-right"></i></span>
                            <GithubLink item={d.target} repo={repo} /> (co-changed <strong>{d.source.cocommits(d.target).length}</strong> times)
                        </li>
                    ))}
                </ul>
            </div>
            <div className="columns">
                <div className="column">
                    <h2 className="title is-6">Outgoing Calls</h2>
                    <ul>
                        {evoOutDeps.filter(isAllowedDep).map(d => (
                            <li>
                                <GithubLink item={d.source} repo={repo} />
                                <span className="icon"><i className="fas fa-arrow-right"></i></span>
                                <GithubLink item={d.target} repo={repo} /> (co-changed <strong>{d.source.cocommits(d.target).length}</strong> times)
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>;
    }
}