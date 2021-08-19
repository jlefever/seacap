import React from "react";

import "bulma/css/bulma.css";
import Client from "../Client";
import MvpDto from "../dtos/MvpDto";
import Breadcrumb from "./Breadcrumb";
import RepoDto from "../dtos/RepoDto";
import GithubLink from "./GithubLink";
import _ from "lodash";

import KindFilter from "./KindFilter";
import Dep from "../models/Dep";
import { createChanges, createDeps, createEntities } from "../models/builders";
import EntityModalLink from "./EntityModalLink";
import Change from "../models/Change";

const { map, sum, groupBy, filter } = _;

export interface MvpDashProps {
    repoName: string;
    num: number;
};

interface MvpDashState {
    repo?: RepoDto;
    mvp?: MvpDto;
    entityKinds: string[];
    allowedEntityKinds: string[];
}

export default class MvpDash extends React.Component<MvpDashProps, MvpDashState> {
    constructor(props: MvpDashProps) {
        super(props);
        this.state = { allowedEntityKinds: [], entityKinds: [] };
    }

    override componentDidMount() {
        const client = new Client();
        client.getEntityKinds().then(entityKinds => this.setState({ entityKinds, allowedEntityKinds: entityKinds }));
        client.getRepo(this.props.repoName).then(repo => this.setState({ repo }));
        client.getMvp(this.props.repoName, this.props.num).then(mvp => this.setState({ mvp }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { mvp, repo, allowedEntityKinds } = this.state;
        const name = `mvp-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{ name: "home", url: "/" }, { name: repoName, url: `/${repoName}` }]} current={name} />
        </>;

        if (!mvp || !repo) {
            return <>{header}<span>Loading...</span></>;
        }

        function getCommitLink(commitHash: string) {
            return <a href={`${repo?.githubUrl}/commit/${commitHash}`} target="_blank"><strong>{commitHash}</strong></a>;
        }

        const { summary: sum } = mvp;

        const entitiesMap = createEntities(mvp.entities);
        const changesMap = createChanges(entitiesMap, mvp.changes);

        // const entities = Array.from(entitiesMap.values());
        const changes = Array.from(changesMap.values());

        const groups = groupBy(changes, c => c.commitHash);

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
                </div>
            </div> */}

            <h2 className="title is-4">Description</h2>
            <div className="content">
                The file <strong><GithubLink item={sum.x} repo={repo} /></strong> and <strong><GithubLink item={sum.y} repo={repo} /></strong> have changed together <strong>{sum.cochange}</strong> times but have no structural dependency.
            </div>

            <h2 className="title is-4">Commits</h2>
            <div className="content">
                Below we list each commit that has contributed to this modularity violation pair.
            </div>
            <div className="columns">
                <div className="column content">
                    <ul>
                        {map(Array.from(Object.entries(groups)), ([commit, changes]) => (
                            <li>
                                <div>{getCommitLink(commit)}</div>
                                <ul>
                                    <li>
                                        <div><GithubLink item={sum.x} repo={repo} /></div>
                                        <ul>
                                            {map(filter(changes, c => c.entity.file.name === sum.x), change => (
                                                <li>
                                                    <GithubLink item={change.entity} repo={repo} /> (<strong>{change.churn}</strong> lines changed)
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                    <li>
                                    <div><GithubLink item={sum.y} repo={repo} /></div>
                                        <ul>
                                            {map(filter(changes, c => c.entity.file.name === sum.y), change => (
                                                <li>
                                                    <GithubLink item={change.entity} repo={repo} /> (<strong>{change.churn}</strong> lines changed)
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </ul>
                                {/* <ul>
                                    {map(changes, change => (
                                        <li>
                                            <GithubLink item={change.entity} repo={repo} /> (<strong>{change.churn}</strong> lines changed)
                                        </li>
                                    ))}
                                </ul> */}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>;
    }
}
