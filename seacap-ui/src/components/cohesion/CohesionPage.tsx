import _ from "lodash";
import React from "react";
import { Menu, Tab } from "semantic-ui-react";
import Dep from "../../models/Dep";
import Entity from "../../models/Entity";
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
    data?: [Entity, Dep[]];
}

export default class CohesionPage extends React.Component<CohesionPageProps, CohesionPageState> {
    constructor(props: CohesionPageProps) {
        super(props);
        this.state = {};
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

        return <>
            {header}
            <div className="ui text container">
                <div className="ui basic segment">
                    <ClientView center={center} deps={deps} repo={repo} />
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