import React from "react";
import Repo from "../../models/Repo";
import MyIcon from "../MyIcon";
import ExternalCommitLink from "./ExternalCommitLink";

export interface CommitItemProps {
    hash: string;
    repo: Repo;
}

export default (props: CommitItemProps) => {
    const { hash, repo } = props;
    return <div className="item">
        <MyIcon name="vs-git-commit" size="large" className="middle aligned" />
        <div className="middle aligned content">
            <div className="header">
                <ExternalCommitLink hash={hash} repo={repo} />
            </div>
        </div>
    </div>
}