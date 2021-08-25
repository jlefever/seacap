import React from "react";
import { EntityCluster } from "../../clustering/preprocessors";
import Repo from "../../models/Repo";
import ClusterForm from "./ClusterForm";
import ClusterTree from "./ClusterTree";

export interface CohesionPageProps {
    repo: Repo
};

interface CohesionPageState {
    cluster?: EntityCluster;
}

export default class CohesionPage extends React.Component<CohesionPageProps, CohesionPageState> {
    constructor(props: CohesionPageProps) {
        super(props);
        this.state = {};
    }

    override render() {
        return <div>
            <ClusterForm repo={this.props.repo} onCluster={cluster => this.setState({ cluster })} />
            <hr />
            <div className="content">
                {this.state.cluster && <ClusterTree repo={this.props.repo} cluster={this.state.cluster} clusterPath="1" />}
            </div>
        </div>
    }
}