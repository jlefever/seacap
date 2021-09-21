import _ from "lodash";
import React from "react";
import { hasChanged, onlySourceChanges, onlyTargetChanges } from "../../clustering/preprocessors";
import Change from "../../models/Change";
import Dep from "../../models/Dep";
import Repo from "../../models/Repo";
import ClusterForm from "./ClusterForm";
import CommitView from "./CommitView";
import EntityView from "./EntityView";
import IconMenu from "./IconMenu";
import QuantMenu from "./QuantMenu";

export interface CohesionPageProps {
    repo: Repo
};

interface CohesionPageState {
    data?: [Dep[], Change[]];
    activeView: string;
}

export default class CohesionPage extends React.Component<CohesionPageProps, CohesionPageState> {
    constructor(props: CohesionPageProps) {
        super(props);
        this.state = { activeView: "Clients" };
    }

    override render() {
        const { repo } = this.props;

        const header = <div className="ui text container">
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

        const { activeView } = this.state;

        const view = (() => {
            if (activeView === "File Interface") {
                return <EntityView
                    repo={repo} relationName="clients"
                    entities={deps.map(d => d.target)}
                    getRelatedEntities={e => deps.filter(d => d.target === e).map(d => d.source)}
                    getCommitsFor={e => _.uniq(changes.filter(c => hasChanged(c, e)).map(c => c.commitHash))}
                />
            }

            if (activeView === "Clients") {
                return <EntityView
                    repo={repo} relationName="interfaces"
                    entities={deps.map(d => d.source)}
                    getRelatedEntities={e => deps.filter(d => d.source === e).map(d => d.target)}
                    getCommitsFor={e => _.uniq(changes.filter(c => hasChanged(c, e)).map(c => c.commitHash))}
                />
            }

            if (activeView === "Commits") {
                return <CommitView repo={repo}
                    commits={_.uniq(changes.map(c => c.commitHash))}
                    getSources={h => sourceChanges.filter(c => c.commitHash === h).map(c => c.entity)}
                    getTargets={h => targetChanges.filter(c => c.commitHash === h).map(c => c.entity)}
                />
            }

            throw new Error();
        })();

        return <>
            {header}
            <div className="ui text container">
                <div className="ui basic segment">
                    {view}
                    <div className="ui right rail">
                        <IconMenu items={{
                            "Browse": "vs-book",
                            "Clustering": "vs-group-by-ref-type"
                        }} size="large" active="Browse" color="teal" onChange={console.log} />
                        <QuantMenu items={{
                            "Clients": 32,
                            "File Interface": 8,
                            "Commits": 5
                        }} active={activeView} color="violet" onChange={v => this.setState({ activeView: v })} />
                    </div>
                </div>
            </div>
        </>
    }
}