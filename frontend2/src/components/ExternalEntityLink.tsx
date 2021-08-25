import * as R from "ramda";
import React from "react";
import Entity from "../models/Entity";
import Repo from "../models/Repo";
import GithubFileLink from "./github/GithubFileLink";

interface ExternalEntityLinkProps {
    entity: Entity | string;
    repo: Repo;
    className?: string;
}

export default (props: ExternalEntityLinkProps) => {
    const { entity, repo, className } = props;
    const { githubUrl, leadRef } = repo;

    if (typeof (entity) !== "string" && !entity.exists) {
        return <span>{entity.name}</span>;
    }

    const filename = typeof (entity) === "string"
        ? entity
        : entity.file.name;

    const linenos = typeof (entity) === "string"
        ? undefined
        : entity.kind === "file" ? undefined : entity.linenos;

    const name = typeof (entity) === "string"
        ? R.last(entity.split("/"))
        : entity.kind === "file" ? R.last(entity.name.split("/")) : entity.name;

    return <GithubFileLink
        repoUrl={githubUrl}
        gitRef={leadRef}
        filename={filename}
        linenos={linenos!}
        title={filename}>
        {name}
    </GithubFileLink>;
};