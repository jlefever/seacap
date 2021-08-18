import React from "react";

import "bulma/css/bulma.css";
import _ from "lodash";
import Client from "../Client";
import { createChanges, createDeps, createEntities } from "../models/builders";
import { Entity } from "../models/Entity";
import Change from "../models/Change";
import Dep from "../models/Dep";
import Breadcrumb from "./Breadcrumb";
import RepoDto from "../dtos/RepoDto";
import GithubLink from "./GithubLink";

export interface MaintPageProps {
    repoName: string;
};

interface MaintPageState {
    repo?: RepoDto;
    entities?: Entity[];
    changes?: Change[];
    deps?: Dep[];
    activeEntityKind: string;
};

export default class MaintPage extends React.Component<MaintPageProps, MaintPageState> {
    constructor(props: MaintPageProps) {
        super(props);
        this.state = { activeEntityKind: "file" };
    }

    override componentDidMount() {
        const client = new Client();
        client.getRepo(this.props.repoName).then(repo => this.setState({ repo }));
        client.getEntities(this.props.repoName).then(entityDtos => {
            client.getChanges(this.props.repoName).then(changeDtos => {
                client.getDeps(this.props.repoName).then(depDtos => {
                    const entities = createEntities(entityDtos);
                    const changes = createChanges(entities, changeDtos);
                    const deps = createDeps(entities, depDtos);

                    this.setState({
                        entities: Array.from(entities.values()),
                        changes: Array.from(changes.values()),
                        deps: deps
                    });
                });
            });
        });
    }

    override render() {
        const { repoName } = this.props;
        const { repo, entities, changes, deps, activeEntityKind } = this.state;

        const header = <>
            <h1 className="title is-3">maintenance</h1>
            <Breadcrumb crumbs={[{ name: "home", url: "/" }, { name: repoName, url: `/${repoName}` }]} current="maintenance" />
        </>;

        if (!repo || !entities || !changes || !deps) {
            return <>{header}<span>Loading...</span></>;
        }

        const entityKinds = _.sortBy(_.uniq(_.map(entities, e => e.kind)));
        const activeEntities = _.filter(entities, e => e.kind == activeEntityKind && e.exists);

        const sumChurn = (changes: readonly Change[]) => _.sum(_.map(changes, c => c.churn));

        const totalEntities = activeEntities.length;

        const records = _.chain(activeEntities).map(entity => {
            return {
                entity: entity,
                changeFreq: entity.changes.length,
                changeChurn: sumChurn(entity.changes)
            }
        }).value();

        const records2 = _.orderBy(_.map(records, r1 => {
            return {
                ...r1,
                changeFreqPercentile: _.filter(records, r2 => r1.changeFreq > r2.changeFreq).length / totalEntities,
                changeChurnPercentile: _.filter(records, r2 => r1.changeChurn > r2.changeChurn).length / totalEntities,
            };
        }), r => r.changeFreq, "desc");

        return <>
            {header}
            <div className="tabs is-centered">
                <ul>
                    {entityKinds.map(k => (
                        <li className={k == activeEntityKind ? "is-active" : ""} key={k}>
                            <a onClick={_ => this.setState({ activeEntityKind: k })}>{k}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <table className="table is-hoverable is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Change Frequency</th>
                        <th>Change Churn</th>
                    </tr>
                </thead>
                <tbody>
                    {_.map(records2, r => (
                        <tr key={r.entity.id}>
                            <td><GithubLink item={r.entity} repo={repo} /></td>
                            <td>{r.changeFreq} ({toPercent(r.changeFreqPercentile)})</td>
                            <td>{r.changeChurn} ({toPercent(r.changeChurnPercentile)})</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>;
    }
}

function toPercent(num: number) {
    return (num * 100).toFixed(1) + "%";
}