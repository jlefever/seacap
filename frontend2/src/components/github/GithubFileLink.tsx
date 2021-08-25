import React, { ReactNode } from "react";
import LineRange from "../../models/LineRange";

export interface GithubFileLinkProps {
    repoUrl: string;
    gitRef: string;
    filename: string;
    linenos?: LineRange;
    title?: string;
    className?: string;
    children?: ReactNode;
}

export default (props: GithubFileLinkProps) => {
    let { repoUrl, gitRef, filename, linenos, title, className, children } = props;
    gitRef = gitRef.startsWith("tags/") ? gitRef.substr(5) : gitRef;

    const url = linenos === undefined
        ? `${repoUrl}/blob/${gitRef}/${filename}`
        : `${repoUrl}/blob/${gitRef}/${filename}#L${linenos[0]}-L${linenos[1]}`;
    
    return <a href={url} target="_blank" className={className} title={title}>{children}</a>
}