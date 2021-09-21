import _ from "lodash";
import React from "react";
import { Menu, Tab } from "semantic-ui-react";
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
    data?: [Entity, Dep[]];
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
            <ClusterForm repo={this.props.repo} onSubmit={(center, deps) => this.setState({
                data: [center, deps]
            })} />
            <div className="ui divider"></div>
        </div>;

        if (!this.state.data) {
            return header;
        }

        const [center, deps] = this.state.data;
        const { activeView } = this.state;

        const view = (() => {
            if (activeView === "File Interface") {
                return <FileInterfaceView deps={deps} repo={repo} />
            }

            if (activeView === "Clients") {
                return <ClientView center={center} deps={deps} repo={repo} />
            }

            if (activeView === "Commits") {
                return <CommitView center={center} deps={deps} repo={repo} />
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