import React from "react";
import RepoDto from "../dtos/RepoDto";
import RepoList from "./RepoList";
import RepoListLoader from "./RepoListLoader";

interface HomePageProps {
    repos?: readonly RepoDto[];
}

export default class HomePage extends React.Component<HomePageProps> {
    constructor(props: HomePageProps) {
        super(props);
    }

    override render() {
        const { repos } = this.props;
        return <>
            <div className="ui container">
                <div className="ui huge message">
                    <h1 className="ui huge header">Welcome!</h1>
                    <p><abbr title="Software Engineering Artifact">SEA</abbr> Captain helps you refactor problematic code. Select a project below to get started.</p>
                </div>
            </div>
            <div className="ui hidden divider" />
            <div className="ui text container">
                {repos ? <RepoList repos={repos} /> : <RepoListLoader placeholders={11} />}
            </div>
        </>;
    }
}