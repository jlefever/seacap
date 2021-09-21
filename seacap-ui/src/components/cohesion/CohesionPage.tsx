import _ from "lodash";
import React from "react";
import { Menu, Tab } from "semantic-ui-react";
import { onlySourceChanges, onlyTargetChanges } from "../../clustering/preprocessors";
import Change from "../../models/Change";
import Dep from "../../models/Dep";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import MyIcon from "../MyIcon";
import ClientView from "./ClientView";
import ClusterForm from "./ClusterForm";
import CommitView from "./CommitView";
import FileInterfaceView from "./FileInterfaceView";
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
                return <FileInterfaceView deps={deps} changes={changes} repo={repo} />
            }

            if (activeView === "Clients") {
                return <ClientView deps={deps} changes={changes} repo={repo} />
            }

            if (activeView === "Commits") {
                return <CommitView sourceChanges={sourceChanges} targetChanges={targetChanges} repo={repo} />
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