import React from "react";

import "bulma/css/bulma.css";
import Client from "../Client";
import UifDto from "../dtos/UifDto";
import Breadcrumb from "./Breadcrumb";
import RepoDto from "../dtos/RepoDto";
import GithubLink from "./GithubLink";
import _ from "lodash";

import KindFilter from "./KindFilter";
import Dep from "../models/Dep";
import { createChanges, createDeps, createEntities } from "../models/builders";
import EntityModalLink from "./EntityModalLink";

export interface UifDashProps {
    repoName: string;
    num: number;
};

interface UifDashState {
    repo?: RepoDto;
    uif?: UifDto;
    entityKinds: string[];
    depKinds: string[];
    allowedEntityKinds: string[];
    allowedDepKinds: string[];
}

export default class UifDash extends React.Component<UifDashProps, UifDashState> {
    constructor(props: UifDashProps) {
        super(props);
        this.state = { allowedEntityKinds: [], allowedDepKinds: [], entityKinds: [], depKinds: [] };
    }

    override componentDidMount() {
        const client = new Client();
        client.getEntityKinds().then(entityKinds => this.setState({ entityKinds, allowedEntityKinds: entityKinds }));
        client.getDepKinds().then(depKinds => this.setState({ depKinds, allowedDepKinds: depKinds }));
        client.getRepo(this.props.repoName).then(repo => this.setState({ repo }));
        client.getUif(this.props.repoName, this.props.num).then(uif => this.setState({ uif }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { uif, repo, allowedEntityKinds, allowedDepKinds } = this.state;
        const name = `unstable-interface-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{ name: "home", url: "/" }, { name: repoName, url: `/${repoName}` }]} current={name} />
        </>;

        if (!uif || !repo) {
            return <>{header}<span>Loading...</span></>;
        }

        const { summary: sum } = uif;

        function isAllowedDep(dep: Dep) {
            return allowedEntityKinds.includes(dep.source.kind) && allowedEntityKinds.includes(dep.target.kind);
        }

        function isNonEmpty(dep: Dep) {
            return dep.dtos.length !== 0;
        }

        function filterDtos(dep: Dep) {
            return new Dep(dep.source, dep.target, dep.dtos.filter(d => allowedDepKinds.includes(d.kind)));
        }

        const entities = createEntities(uif.entities);
        const changes = createChanges(entities, uif.changes);
        let inDeps = createDeps(entities, uif.inDeps);
        let evoInDeps = createDeps(entities, uif.evoInDeps);

        inDeps = inDeps.filter(isAllowedDep).map(filterDtos).filter(isNonEmpty);
        evoInDeps = evoInDeps.filter(isAllowedDep).map(filterDtos).filter(isNonEmpty);

        const evoInFiles = [...new Set(evoInDeps.map(d => d.source.file))];

        const evoInEntities = _.groupBy(evoInDeps.filter(isAllowedDep), d => d.target.id);

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
                The file <strong><GithubLink item={sum.tgt} repo={repo} /></strong> is depended on by <strong>{sum.fanin}</strong> files and has co-changed at least twice with <strong>{sum.evoFanin}</strong> of them. So this is a unstable interface with a total of <strong>{sum.size}</strong> files.
            </div>

            <div className="columns">
                <div className="column">
                    <h2 className="title is-6"><abbr title="evolutionarily coupled (co-changed at least twice)">Evo.</abbr> Incoming Files</h2>
                    <ul>{evoInFiles.map(f => <li key={f.id}><GithubLink item={f.name} repo={repo} /></li>)}</ul>
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
            </div>

            <h2 className="title is-4">Alignment</h2>
            <div className="content">
                The following method-to-method dependencies have co-changed at least once. Or in other words, these dependencies are structurally and historically aligned with the file-level unstable interface.
            </div>
            <div className="columns">
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
            </div>
        </>;
    }
}