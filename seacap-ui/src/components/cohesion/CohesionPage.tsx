import _ from "lodash";
import React from "react";
import { Menu, Tab } from "semantic-ui-react";
import Dep from "../../models/Dep";
import Repo from "../../models/Repo";
import MyIcon from "../MyIcon";
import ClientView from "./ClientView";
import ClusterForm from "./ClusterForm";
import IconMenu from "./IconMenu";
import QuantMenu from "./QuantMenu";

export interface CohesionPageProps {
    repo: Repo
};

interface CohesionPageState {
    deps?: Dep[];
}

export default class CohesionPage extends React.Component<CohesionPageProps, CohesionPageState> {
    constructor(props: CohesionPageProps) {
        super(props);
        this.state = {};
    }

    override render() {
        const { repo } = this.props;

        return <>
            <div className="ui text container">
                <ClusterForm repo={this.props.repo} onSubmit={deps => this.setState({ deps })} />
                <div className="ui divider"></div>
            </div>
            <div className="ui text container">
                <div className="ui basic segment">
                    {this.state.deps && <ClientView deps={this.state.deps} repo={repo} />}
                    <div className="ui right rail">
                        <IconMenu items={{
                            "Browse": "vs-book",
                            "Clustering": "vs-group-by-ref-type"
                        }} size="large" active="Browse" onChange={console.log} color="teal" />
                        <QuantMenu items={{
                            "File Interface": 8,
                            "Clients": 32,
                            "Commits": 5
                        }} active="Clients" onChange={console.log} color="violet" />
                    </div>
                </div>
            </div>
        </>
    }
}