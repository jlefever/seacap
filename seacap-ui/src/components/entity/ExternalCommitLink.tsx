import React from "react";
import Repo from "../../models/Repo";
import GithubCommitLink from "../github/GithubCommitLink";

interface ExternalCommitLinkProps {
    hash: string;
    repo: Repo;
}

export default (props: ExternalCommitLinkProps & React.HTMLAttributes<HTMLElement>) => {
    const { hash, repo, ...others } = props;
    const { gitWeb } = repo;

    return <GithubCommitLink
        repoUrl={gitWeb}
        commitHash={hash}
        {...others}>
        {hash}
    </GithubCommitLink>;
};