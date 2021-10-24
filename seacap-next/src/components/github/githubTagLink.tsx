import React, { ReactNode } from "react";

// This might also work for git refs other than tags.
interface GithubTagLinkProps
{
    gitWebUrl: string | null;
    tag: string;
    children?: ReactNode;
}

const GithubTagLink = (props: GithubTagLinkProps & React.HTMLAttributes<HTMLAnchorElement>) =>
{
    const { gitWebUrl, tag, children, ...rest } = props;

    if (gitWebUrl === null)
    {
        <a href="#" {...rest}>{children}</a>;
    }

    const url = `${gitWebUrl}/tree/${tag}`;
    return <a href={url} target="_blank" {...rest}>{children}</a>;
};

export default GithubTagLink;