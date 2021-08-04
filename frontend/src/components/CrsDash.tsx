import React from "react";

import "bulma/css/bulma.css";
import Client from "../Client";
import CrsDto from "../dtos/CrsDto";
import Breadcrumb from "./Breadcrumb";

export interface CrsDashProps {
    repoName: string;
    num: number;
};

interface CrsDashState {
    crs?: CrsDto;
}

export default class CrsDash extends React.Component<CrsDashProps, CrsDashState> {
    constructor(props: CrsDashProps) {
        super(props);
        this.state = { crs: undefined };
    }

    override componentDidMount() {
        const client = new Client();
        client.getCrs(this.props.repoName, this.props.num).then(crs => this.setState({ crs }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { crs } = this.state;
        const name = `crossing-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{name: "home", url: "/"}, {name: repoName, url: `/${repoName}`}]} current={name} />
        </>;

        if (!crs) {
            return <>{header}<span>Loading...</span></>;
        }

        return <>{header}<span>TODO</span></>;
    }
}