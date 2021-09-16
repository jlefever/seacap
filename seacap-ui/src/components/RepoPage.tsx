import React from "react";
import Repo from "../models/Repo";
import RepoProvider from "../providers/RepoProvider";
import CohesionPage from "./cohesion/CohesionPage";
import Loading from "./Loading";
import NotFound from "./NotFound";

export interface RepoPageProps {
    provider: RepoProvider;
    name: string;
    url: string;
};

interface RepoPageState {
    repo?: Repo | null;
}

export default class RepoPage extends React.Component<RepoPageProps, RepoPageState> {
    constructor(props: RepoPageProps) {
        super(props);
        this.state = {};
    }

    override componentDidMount() {
        const { provider, name } = this.props;
        provider.getRepo(name).then(repo => this.setState({ repo }));
    }

    override render() {
        const { repo } = this.state;

        if (repo === undefined) {
            return <Loading />;
        }

        if (repo === null) {
            return <NotFound />;
        }

        return <CohesionPage repo={repo} />;
    }
}