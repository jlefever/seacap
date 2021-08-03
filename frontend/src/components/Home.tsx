import "@fortawesome/fontawesome-free/css/all.css";
import "bulma/css/bulma.css";
import React from "react";
import Client from "../Client";
import RepoDto from "../dtos/RepoDto";
import RepoTable from "./RepoTable";

interface HomeState {
    repos: RepoDto[];
}

export default class Home extends React.Component<{}, HomeState> {
    constructor(props: {}) {
        super(props);
        this.state = { repos: [] }
    }

    override componentDidMount() {
        new Client().getRepos().then(res => this.setState({repos: res}));
    }

    override render() {
        return <RepoTable repos={this.state.repos} />;
    }
}