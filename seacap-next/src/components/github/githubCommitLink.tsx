import React, { ReactNode } from "react";

interface GithubCommitLinkProps
{
    gitWebUrl: string | null;
    commitHash: string;
    children: ReactNode;
}

const GithubCommitLink = (props: GithubCommitLinkProps & React.HTMLAttributes<HTMLElement>) =>
{
    const { gitWebUrl, commitHash, children, ...rest } = props;

    if (gitWebUrl === null)
    {
        <a href="#" {...rest}>{children}</a>;
    }

    const url = `${gitWebUrl}/commit/${commitHash}`;
    return <a href={url} target="_blank" {...rest}>{children}</a>;
};

export default GithubCommitLink;