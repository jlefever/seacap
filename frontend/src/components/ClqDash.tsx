import React from "react";

import "bulma/css/bulma.css";
import Client from "../Client";
import ClqDto from "../dtos/ClqDto";
import Breadcrumb from "./Breadcrumb";
import RepoDto from "../dtos/RepoDto";
import GithubLink from "./GithubLink";
import _ from "lodash";

import KindFilter from "./KindFilter";
import Dep from "../models/Dep";
import { createChanges, createDeps, createEntities } from "../models/builders";
import EntityModalLink from "./EntityModalLink";

const { map, sum, groupBy, filter } = _;

export interface ClqDashProps {
    repoName: string;
    num: number;
};

interface ClqDashState {
    repo?: RepoDto;
    clq?: ClqDto;
    entityKinds: string[];
    depKinds: string[];
    allowedEntityKinds: string[];
    allowedDepKinds: string[];
}

export default class ClqDash extends React.Component<ClqDashProps, ClqDashState> {
    constructor(props: ClqDashProps) {
        super(props);
        this.state = { allowedEntityKinds: [], allowedDepKinds: [], entityKinds: [], depKinds: [] };
    }

    override componentDidMount() {
        const client = new Client();
        client.getEntityKinds().then(entityKinds => this.setState({ entityKinds, allowedEntityKinds: entityKinds }));
        client.getDepKinds().then(depKinds => this.setState({ depKinds, allowedDepKinds: depKinds }));
        client.getRepo(this.props.repoName).then(repo => this.setState({ repo }));
        client.getClq(this.props.repoName, this.props.num).then(clq => this.setState({ clq }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { clq, repo, allowedEntityKinds, allowedDepKinds } = this.state;
        const name = `crossing-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{ name: "home", url: "/" }, { name: repoName, url: `/${repoName}` }]} current={name} />
        </>;

        if (!clq || !repo) {
            return <>{header}<span>Loading...</span></>;
        }

        const { summary: sum } = clq;

        function isAllowedDep(dep: Dep) {
            return allowedEntityKinds.includes(dep.source.kind) && allowedEntityKinds.includes(dep.target.kind);
        }

        function isNonEmpty(dep: Dep) {
            return dep.dtos.length !== 0;
        }

        function filterDtos(dep: Dep) {
            return new Dep(dep.source, dep.target, dep.dtos.filter(d => allowedDepKinds.includes(d.kind)));
        }

        const entities = createEntities(clq.entities);
        const changes = createChanges(entities, clq.changes);
        let deps = createDeps(entities, clq.deps);

        deps = deps.filter(isAllowedDep).map(filterDtos).filter(isNonEmpty);
        console.log(sum.subCliques);

        return <>
            {header}
            {/* <div className="columns">
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
            </div> */}

            <h2 className="title is-4">Description</h2>
            <div className="content">
                The following <strong>{sum.members.length}</strong> files form a <a href="https://en.wikipedia.org/wiki/Strongly_connected_component" target="_blank">strongly connected component</a>.
            </div>

            <div className="columns">
                <div className="column">
                    <ul>{sum.members.map(f => <li key={f}><GithubLink item={f} repo={repo} /></li>)}</ul>
                </div>
            </div>

            <h2 className="title is-4">Sub Cliques</h2>

            <div className="content">
                {sum.subCliques.length === 0 && <span>No cliques found below the file level.</span>}
                <ul>
                    {sum.subCliques.map(entityIds => (
                        <li>
                            <div>Sub Clique</div>
                            <ul>
                                {map(entityIds, id => (
                                    <li><GithubLink item={entities.get(parseInt(id))!} repo={repo} /></li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </>;
    }
}