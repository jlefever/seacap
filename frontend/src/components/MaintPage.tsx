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
import { Bar } from 'react-chartjs-2';

export interface MaintPageProps {
    repoName: string;
};

interface MaintPageState {
    repo?: RepoDto;
    entities?: Entity[];
    changes?: Change[];
    deps?: Dep[];
    activeEntityKind: string;
    log: boolean;
};

export default class MaintPage extends React.Component<MaintPageProps, MaintPageState> {
    constructor(props: MaintPageProps) {
        super(props);
        this.state = { activeEntityKind: "file", log: false };
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

        const activeEntityKindPlural = activeEntityKind === "class" ? "classes" : `${activeEntityKind}s`;

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

        const sqrt = Math.sqrt;
        const sq = (x: number) => Math.pow(x, 2);
        const { map, sum, uniq, sortedUniq, sortBy, groupBy, countBy } = _;

        const meanChangeFreq = sum(map(records, r => r.changeFreq)) / records.length;
        const meanChangeChurn = sum(map(records, r => r.changeChurn)) / records.length;

        const varChangeFreq = sum(map(records, r => sq(r.changeFreq - meanChangeFreq))) / records.length;
        const varChangeChurn = sum(map(records, r => sq(r.changeChurn - meanChangeChurn))) / records.length;

        const stdChangeFreq = sqrt(varChangeFreq);
        const stdChangeChurn = sqrt(varChangeChurn);

        const histChangeFreq = countBy(records, r => r.changeFreq);
        console.log(Object.keys(histChangeFreq));
        console.log(Object.values(histChangeFreq));

        const dataChangeFreq = {
            labels: Object.keys(histChangeFreq),
            datasets: [
                {
                    label: `# ${activeEntityKindPlural}`,
                    data: Object.values(histChangeFreq)
                }
            ]
        };

        const optsChangeFreq = {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Change Frequency Distribution'
                }
            },
            scales: {
                x: {
                    display: true,
                },
                y: {
                    display: true,
                    type: this.state.log ? "logarithmic" : "linear"
                }
            }
        };

        const records2 = _.orderBy(_.map(records, r1 => {
            return {
                ...r1,
                changeFreqPercentile: _.filter(records, r2 => r1.changeFreq > r2.changeFreq).length / totalEntities,
                changeChurnPercentile: _.filter(records, r2 => r1.changeChurn > r2.changeChurn).length / totalEntities,
                changeFreqZ: (r1.changeFreq - meanChangeFreq) / stdChangeFreq,
                changeChurnZ: (r1.changeChurn - meanChangeChurn) / stdChangeChurn,
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
            There are <strong>{records.length}</strong> {activeEntityKindPlural}.
            <table className="table is-fullwidth">
                <thead>
                    <tr>
                        <th></th>
                        <th>Mean</th>
                        <th>Variance</th>
                        <th>Standard Deviation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Change Frequency</th>
                        <td>{meanChangeFreq.toFixed(3)}</td>
                        <td>{varChangeFreq.toFixed(3)}</td>
                        <td>{stdChangeFreq.toFixed(3)}</td>
                    </tr>
                    <tr>
                        <th>Change Churn</th>
                        <td>{meanChangeChurn.toFixed(3)}</td>
                        <td>{varChangeChurn.toFixed(3)}</td>
                        <td>{stdChangeChurn.toFixed(3)}</td>
                    </tr>
                </tbody>
            </table>
            <form className="form">
                <div className="field">
                    <div className="control">
                        <label className="checkbox">
                            <input type="checkbox" onChange={e => this.setState({ log: e.target.checked })} /> Use a logarithmic y-axis
                        </label>
                    </div>
                </div>
            </form>
            <Bar data={dataChangeFreq} options={optsChangeFreq} />
            <div className="pt-5 pb-2">
                <div className="notification is-info">
                    For both <abbr title="Change Frequency">CF</abbr> and <abbr title="Change Churn">CC</abbr>, we list the raw number, the <a href="https://en.wikipedia.org/wiki/Percentile" target="_blank">percentile</a>, and the <a href="https://en.wikipedia.org/wiki/Standard_score" target="_blank">standard score</a>.
                </div>
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
                            <td>{r.changeFreq} ({toPercent(r.changeFreqPercentile)}) ({r.changeFreqZ.toFixed(1)})</td>
                            <td>{r.changeChurn} ({toPercent(r.changeChurnPercentile)}) ({r.changeChurnZ.toFixed(1)})</td>
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