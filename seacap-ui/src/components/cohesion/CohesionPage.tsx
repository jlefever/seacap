import _ from "lodash";
import React from "react";
import { hasChanged, onlySourceChanges, onlyTargetChanges } from "../../clustering/preprocessors";
import Change from "../../models/Change";
import Dep from "../../models/Dep";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import ClusterForm from "./ClusterForm";
import ClusterView from "./ClusterView";
import CommitView from "./CommitView";
import EntityView from "./EntityView";
import IconMenu from "./IconMenu";
import QuantMenu from "./QuantMenu";

export interface CohesionPageProps {
    repo: Repo
};

interface CohesionPageState {
    data?: [Dep[], Change[]];
    activeClusterView: string;
    activeItemView: string;
}

function randClustering<T>(items: T[], k: number): T[][] {
    return Object.values(_.groupBy(items, () => _.random(1, k)));
}

export default class CohesionPage extends React.Component<CohesionPageProps, CohesionPageState> {
    constructor(props: CohesionPageProps) {
        super(props);
        this.state = { activeClusterView: "Browse", activeItemView: "Clients" };
    }

    override render() {
        const { repo } = this.props;

        const header = <div className="ui container">
            <ClusterForm repo={this.props.repo} onSubmit={(deps, changes) => this.setState({
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
            getRelatedEntities={e => deps.filter(d => d.target === e).map(d => d.source)}
            getCommitsFor={e => _.uniq(changes.filter(c => hasChanged(c, e)).map(c => c.commitHash))}
        />;

        const renderSources = (entities: Entity[]) => <EntityView
            repo={repo} relationName="interfaces"
            entities={entities}
            getRelatedEntities={e => deps.filter(d => d.source === e).map(d => d.target)}
            getCommitsFor={e => _.uniq(changes.filter(c => hasChanged(c, e)).map(c => c.commitHash))}
        />;

        const renderCommits = (hashes: string[]) => <CommitView repo={repo}
            commits={hashes}
            getSources={h => sourceChanges.filter(c => c.commitHash === h).map(c => c.entity)}
            getTargets={h => targetChanges.filter(c => c.commitHash === h).map(c => c.entity)}
        />;

        const view = (() => {
            const targets = _.uniq(deps.map(d => d.target));
            const sources = _.uniq(deps.map(d => d.source));
            const commits = _.uniq(changes.map(c => c.commitHash));

            if (activeClusterView === "Clustering") {
                if (activeItemView === "File Interface") {
                    return <ClusterView clusters={randClustering(targets, 5)} render={renderTargets} />
                }

                if (activeItemView === "Clients") {
                    return <ClusterView clusters={randClustering(sources, 5)} render={renderSources} />
                }

                if (activeItemView === "Commits") {
                    return <ClusterView clusters={randClustering(commits, 5)} render={renderCommits} />
                }
            }

            if (activeItemView === "File Interface") {
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
                            "Clients": 32,
                            "File Interface": 8,
                            "Commits": 5
                        }} active={activeItemView} onChange={v => this.setState({ activeItemView: v })} />
                    </div>
                    <div className="twelve wide column">
                    {view}
                        {/* <div className="ui basic segment">
                            {view}
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    }
}