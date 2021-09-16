import React, { ReactNode } from "react";

export interface GithubCommitLinkProps {
    repoUrl: string;
    tag: string;
    children?: ReactNode;
}

export default (props: GithubCommitLinkProps & React.HTMLAttributes<HTMLAnchorElement>) => {
    let { repoUrl, tag, children, ...other } = props;
    tag = tag.startsWith("tags/") ? tag.substr(5) : tag;

    return <a href={`${repoUrl}/tree/${tag}`} target="_blank" {...other} >{children}</a>
}