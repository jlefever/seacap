import React, { ReactNode } from "react";
import LineRange from "../../models/LineRange";

export interface GithubFileLinkProps {
    repoUrl: string;
    gitRef: string;
    filename: string;
    linenos?: LineRange | null;
    children?: ReactNode;
}

export default (props: GithubFileLinkProps & React.HTMLAttributes<HTMLElement>) => {
    let { repoUrl, gitRef, filename, linenos, children, ...others } = props;
    gitRef = gitRef.startsWith("tags/") ? gitRef.substr(5) : gitRef;

    const url = (linenos === undefined || linenos === null)
        ? `${repoUrl}/blob/${gitRef}/${filename}`
        : `${repoUrl}/blob/${gitRef}/${filename}#L${linenos[0]}-L${linenos[1]}`;
    
    return <a href={url} target="_blank" {...others}>{children}</a>
}