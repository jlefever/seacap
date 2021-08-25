import React, { ReactNode } from "react";

export interface GithubCommitLinkProps {
    repoUrl: string;
    commitHash: string;
    title?: string;
    className?: string;
    children?: ReactNode;
}

export default (props: GithubCommitLinkProps) => {
    const { repoUrl, commitHash, title, className, children } = props;

    return <a href={`${repoUrl}/commit/${commitHash}`} target="_blank" className={className} title={title}>
        {children}
    </a>
}