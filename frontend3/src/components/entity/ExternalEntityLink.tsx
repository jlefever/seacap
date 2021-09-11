import * as R from "ramda";
import React from "react";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import GithubFileLink from "../github/GithubFileLink";

interface ExternalEntityLinkProps {
    entity: Entity | string;
    repo: Repo;
}

export default (props: ExternalEntityLinkProps & React.HTMLAttributes<HTMLElement>) => {
    const { entity, repo, ...others } = props;
    const { githubUrl, leadRef } = repo;

    const filename = typeof (entity) === "string"
        ? entity
        : entity.file.name;

    const linenos = typeof (entity) === "string"
        ? undefined
        : entity.kind === "file" ? undefined : entity.linenos;

    const name = typeof (entity) === "string"
        ? R.last(entity.split("/")) || entity
        : entity.shortName;

    if (typeof (entity) !== "string" && !entity.exists) {
        return <span {...others}>{name}</span>;
    }

    return <GithubFileLink
        repoUrl={githubUrl}
        gitRef={leadRef}
        filename={filename}
        linenos={linenos!}
        {...others}>
        {name}
    </GithubFileLink>;
};