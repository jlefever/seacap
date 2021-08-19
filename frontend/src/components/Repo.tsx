import React from "react";

import "bulma/css/bulma.css";
import CrsSummaryDto from "../dtos/CrsSummaryDto";
import UifSummaryDto from "../dtos/UifSummaryDto";
import Client from "../Client";
import { Link } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import MvpSummaryDto from "../dtos/MvpSummaryDto";
import ClqSummaryDto from "../dtos/ClqSummaryDto";

export interface RepoProps {
    name: string;
    url: string;
};

interface RepoState {
    crsSums: CrsSummaryDto[];
    uifSums: UifSummaryDto[];
    mvpSums: MvpSummaryDto[];
    clqSums: ClqSummaryDto[];
}

export default class Repo extends React.Component<RepoProps, RepoState> {
    constructor(props: RepoProps) {
        super(props);
        this.state = { crsSums: [], uifSums: [], mvpSums: [], clqSums: [] };
    }

    override componentDidMount() {
        const client = new Client();
        client.getCrsSummaries(this.props.name).then(crsSums => this.setState({ crsSums }));
        client.getUifSummaries(this.props.name).then(uifSums => this.setState({ uifSums }));
        client.getMvpSummaries(this.props.name).then(mvpSums => this.setState({ mvpSums }));
        client.getClqSummaries(this.props.name).then(clqSums => this.setState({ clqSums }));
    }

    override render() {
        const { name, url } = this.props;
        const { crsSums, uifSums, mvpSums, clqSums } = this.state;

        return <div>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{name: "home", url: "/"}]} current={name} />
            {/* <hr /> */}
            <div className="columns">
                <div className="column">
                    <h2 className="title is-5">Crossings</h2>
                    <ul>
                        {crsSums.map(s => {
                            const seg = `crossing-${s.num}`;
                            return <li key={s.num}><Link to={`${url}/${seg}`}>{seg}</Link></li>
                        })}
                    </ul>
                </div>
                <div className="column">
                    <h2 className="title is-5">Unstable Interfaces</h2>
                    <ul>
                        {uifSums.map(s => {
                            const seg = `unstable-interface-${s.num}`;
                            return <li key={s.num}><Link to={`${url}/${seg}`}>{seg}</Link></li>
                        })}
                    </ul>
                </div>
                <div className="column">
                    <h2 className="title is-5">Modularity Violation Pairs</h2>
                    <ul>
                        {mvpSums.map(s => {
                            const seg = `mvp-${s.num}`;
                            return <li key={s.num}><Link to={`${url}/${seg}`}>{seg}</Link></li>
                        })}
                    </ul>
                </div>
                <div className="column">
                    <h2 className="title is-5">Cliques</h2>
                    <ul>
                        {clqSums.map(s => {
                            const seg = `clique-${s.num}`;
                            return <li key={s.num}><Link to={`${url}/${seg}`}>{seg}</Link></li>
                        })}
                    </ul>
                </div>
            </div>
        </div>;
    }
}