import "bulma/css/bulma.css";
import { times } from "lodash";
import React from "react";
import RepoDto from "../dtos/RepoDto";
import { Entity, getShortFilename } from "../util";

export interface GithubLinkProps {
    item: string | Entity;
    repo: RepoDto;
};

function getUrl(item: string | Entity, repo: RepoDto) {
    const { githubUrl, leadRef } = repo;
    const ref = leadRef.startsWith("tags/") ? leadRef.substr(5) : leadRef;

    if (typeof (item) === "string") {
        return `${githubUrl}/blob/${ref}/${item}`;
    }

    if (!item.exists) {
        return "#";
    }

    if (item.kind === "file") {
        return `${githubUrl}/blob/${ref}/${item.name}`;
    }

    const [from, to] = item.linenos!;
    return `${githubUrl}/blob/${ref}/${item.file.name}#L${from}-L${to}`;
}

function getTitle(item: string | Entity) {
    if (typeof (item) === "string") {
        return item;
    }

    return item.displayName;
}

function getName(item: string | Entity) {
    if (typeof (item) === "string") {
        return getShortFilename(item);
    }

    if (item.kind === "file") {
        return getShortFilename(item.name);
    }

    return item.name;
}

export default (props: GithubLinkProps) => (
    <a
        href={getUrl(props.item, props.repo)} title={getTitle(props.item)} target="_blank"
    // className="has-text-weight-semibold"
    >{getName(props.item)}</a>
);