import "bulma/css/bulma.css";
import React from "react";
import RepoDto from "../dtos/RepoDto";

export interface GithubLinkProps {
    path: string;
    repo: RepoDto;
};

function getUrl(path: string, repo: RepoDto) {
    const { githubUrl, leadRef } = repo;
    const ref = leadRef.startsWith("tags/") ? leadRef.substr(5) : leadRef;
    return `${githubUrl}/blob/${ref}/${path}`;
}

function getName(path: string) {
    const arr = path.split("/");
    return arr[arr.length - 1];
}

export default (props: GithubLinkProps) => (
    <a
        href={getUrl(props.path, props.repo)} title={props.path} target="_blank"
    // className="has-text-weight-semibold"
    >{getName(props.path)}</a>
);