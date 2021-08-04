import React from "react";

import "bulma/css/bulma.css";
import Client from "../Client";
import Breadcrumb from "./Breadcrumb";
import UifDto from "../dtos/UifDto";

export interface UifDashProps {
    repoName: string;
    num: number;
};

interface UifDashState {
    uif?: UifDto;
}

export default class UifDash extends React.Component<UifDashProps, UifDashState> {
    constructor(props: UifDashProps) {
        super(props);
        this.state = { uif: undefined };
    }

    override componentDidMount() {
        const client = new Client();
        client.getUif(this.props.repoName, this.props.num).then(uif => this.setState({ uif }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { uif } = this.state;
        const name = `unstable-interface-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{name: "home", url: "/"}, {name: repoName, url: `/${repoName}`}]} current={name} />
        </>;

        if (!uif) {
            return <>{header}<span>Loading...</span></>;
        }

        return <>{header}<span>TODO</span></>;
    }
}