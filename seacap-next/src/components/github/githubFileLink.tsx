import LineRange from "models/lineRange";
import React, { ReactNode } from "react";

interface GithubFileLinkProps
{
    gitWebUrl: string | null;
    gitRef: string;
    filename: string;
    linenos: LineRange | null;
    children: ReactNode;
}

const GithubFileLink = (props: GithubFileLinkProps & React.HTMLAttributes<HTMLElement>) =>
{
    const { gitWebUrl, gitRef, filename, linenos, children, ...rest } = props;

    if (gitWebUrl === null)
    {
        <a href="#" {...rest}>{children}</a>;
    }

    const url = linenos === null
        ? `${gitWebUrl}/blob/${gitRef}/${filename}`
        : `${gitWebUrl}/blob/${gitRef}/${filename}#L${linenos[0]}-L${linenos[1]}`;

    return <a href={url} target="_blank" {...rest}>{children}</a>;
};

export default GithubFileLink;