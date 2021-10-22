import _ from "lodash";
import React from "react";
import Edge from "../base/graph/Edge";
import EdgeBagImpl from "../base/graph/EdgeBagImpl";
import RelationImpl from "../base/mtrd/RelationImpl";
import { onlySourceChanges, onlyTargetChanges } from "../base/preprocessors";
import Change from "../models/Change";
import Dep from "../models/Dep";
import Entity from "../models/Entity";
import Repo from "../models/Repo";
import ClusterForm, { ClusterOptions } from "./ClusterForm";
import ClusterView from "./ClusterView";
import CommitView from "./CommitView";
import EntityView from "./EntityView";
import IconMenu from "./IconMenu";
import PreprocessForm from "./PreprocessForm";
import QuantMenu from "./QuantMenu";

export interface CohesionPageProps {
    repo: Repo
};

interface CohesionPageState {
    data?: [readonly Dep[], readonly Change[]];
    activeClusterView: string;
    activeItemView: string;
    clusterOptions: ClusterOptions;
    waitingForRes: boolean;

    sourceClusters: Entity[][];
    targetClusters: Entity[][];
    commitClusters: string[][];
}

function randClustering<T>(items: T[], k: number): T[][] {
    return Object.values(_.groupBy(items, () => _.random(1, k)));
}

export default class CohesionPage extends React.Component<CohesionPageProps, CohesionPageState> {
    constructor(props: CohesionPageProps) {
        super(props);
        this.state = {
            activeClusterView: "Browse",
            activeItemView: "Interfaces",
            clusterOptions: {
                numTargetClusters: 2,
                numSourceClusters: 2,
                numCommitClusters: 2
            },
            waitingForRes: false,
            sourceClusters: [],
            targetClusters: [],
            commitClusters: [],
        };
    }

    override render() {
        const { repo } = this.props;

        const header = <div className="ui container">
            <PreprocessForm repo={this.props.repo} onSubmit={(deps, changes) => this.setState({
                data: [deps, changes]
            })} />
            <div className="ui divider"></div>
        </div>;

        if (!this.state.data) {
            return header;
        }

        const [deps, changes] = this.state.data;
        const sourceChanges = onlySourceChanges(deps, changes);
        const targetChanges = onlyTargetChanges(deps, changes);

        const { activeClusterView, activeItemView } = this.state;

        const renderTargets = (entities: Entity[]) => <EntityView
            repo={repo} relationName="clients"
            entities={entities}
            getRelatedEntities={e => _.uniq(deps.filter(d => d.target === e).map(d => d.source))}
            getCommitsFor={e => _.uniq(changes.filter(c => c.entity === e).map(c => c.commitHash))}
        />;

        const renderSources = (entities: Entity[]) => <EntityView
            repo={repo} relationName="interfaces"
            entities={entities}
            getRelatedEntities={e => _.uniq(deps.filter(d => d.source === e).map(d => d.target))}
            getCommitsFor={e => _.uniq(changes.filter(c => c.entity === e).map(c => c.commitHash))}
        />;

        const renderCommits = (hashes: string[]) => <CommitView repo={repo}
            commits={hashes}
            getSources={h => sourceChanges.filter(c => c.commitHash === h).map(c => c.entity)}
            getTargets={h => targetChanges.filter(c => c.commitHash === h).map(c => c.entity)}
        />;

        const targets = _.uniq(deps.map(d => d.target));
        const sources = _.uniq(deps.map(d => d.source));
        const commits = _.uniq(changes.map(c => c.commitHash));

        const view = (() => {
            if (activeClusterView === "Clustering") {
                if (activeItemView === "Interfaces") {
                    return <ClusterView clusters={this.state.targetClusters} render={renderTargets} />
                }

                if (activeItemView === "Clients") {
                    return <ClusterView clusters={this.state.sourceClusters} render={renderSources} />
                }

                if (activeItemView === "Commits") {
                    return <ClusterView clusters={this.state.commitClusters} render={renderCommits} />
                }
            }

            if (activeItemView === "Interfaces") {
                return renderTargets(targets);
            }

            if (activeItemView === "Clients") {
                return renderSources(sources);
            }

            if (activeItemView === "Commits") {
                return renderCommits(commits);
            }

            throw new Error();
        })();

        const cluster = (opts: ClusterOptions) => {
            const targetClusters = randClustering(targets, opts.numTargetClusters);
            const sourceClusters = randClustering(sources, opts.numSourceClusters);
            const commitClusters = randClustering(commits, opts.numCommitClusters);
            this.setState({ targetClusters, sourceClusters, commitClusters });
        }

        const cluster2 = () => {
            this.setState({ waitingForRes: true });
            const opts = this.state.clusterOptions;
            type ChangeEdge = Edge<Entity, string>;

            const s2tEdges = new EdgeBagImpl<Entity, Entity, Dep>(sources, targets, deps);
            const t2cEdges = new EdgeBagImpl<Entity, string, ChangeEdge>(targets, commits, targetChanges.map(c => ({ source: c.entity, target: c.commitHash })));
            const s2cEdges = new EdgeBagImpl<Entity, string, ChangeEdge>(sources, commits, sourceChanges.map(c => ({ source: c.entity, target: c.commitHash })));

            const numClusters = {
                "interfaces": opts.numTargetClusters,
                "clients": opts.numSourceClusters,
                "commits": opts.numCommitClusters
            }

            const datasets = [
                {
                    name: "interfaces",
                    size: targets.length,
                },
                {
                    name: "clients",
                    size: sources.length,
                },
                {
                    name: "commits",
                    size: commits.length,
                },
            ];

            const matrices = [
                {
                    rows: "clients",
                    cols: "interfaces",
                    triples: new RelationImpl(s2tEdges).toTriplets()
                },
                {
                    rows: "interfaces",
                    cols: "commits",
                    triples: new RelationImpl(t2cEdges).toTriplets()
                },
                {
                    rows: "clients",
                    cols: "commits",
                    triples: new RelationImpl(s2cEdges).toTriplets()
                }
            ];

            const req = {
                options: {
                    numClusters: numClusters
                },
                graph: {
                    indexSets: datasets,
                    matrices: matrices,
                }
            };

            const headers = {
                "Content-Type": "application/json"
            }

            const body = JSON.stringify(req);

            fetch("/clustering/src", { method: "POST", headers, body })
                .then(res => res.json())
                .then(res => {
                    console.log(res);
                    const targetClusters: any[] = [];
                    const sourceClusters: any[] = [];
                    const commitClusters: any[] = [];

                    const clusters = res["clusters"];

                    // @ts-ignore
                    clusters.forEach(cluster => {
                        if (cluster["set"] === "interfaces") {
                            targetClusters.push(cluster["indices"].map((i: number) => targets[i]));
                        }

                        if (cluster["set"] === "clients") {
                            sourceClusters.push(cluster["indices"].map((i: number) => sources[i]));
                        }

                        if (cluster["set"] === "commits") {
                            commitClusters.push(cluster["indices"].map((i: number) => commits[i]));
                        }
                    });

                    // @ts-ignore
                    this.setState({ targetClusters, sourceClusters, commitClusters });
                })
                .then(_ => this.setState({ waitingForRes: false }));
        }

        return <>
            {header}
            <div className="ui container">
                <div className="ui grid">
                    <div className="four wide column">
                        <IconMenu color="violet" items={{
                            "Browse": "book",
                            "Clustering": "cut"
                        }} active={activeClusterView} onChange={v => this.setState({ activeClusterView: v })} />
                        <div className="ui divider"></div>
                        <QuantMenu color="violet" items={{
                            "Interfaces": targets.length,
                            "Clients": sources.length,
                            "Commits": commits.length
                        }} active={activeItemView} onChange={v => this.setState({ activeItemView: v })} />
                    </div>
                    <div className="twelve wide column">
                        {activeClusterView === "Clustering" && <ClusterForm
                            value={this.state.clusterOptions}
                            loading={this.state.waitingForRes}
                            onChange={clusterOptions => this.setState({ clusterOptions })}
                            onSubmit={cluster2} />}
                        {view}
                    </div>
                </div>
            </div>
        </>
    }
}