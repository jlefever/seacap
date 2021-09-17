import React from "react";
import { Popup } from "semantic-ui-react";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import EntityAncestory from "./EntityAncestory";
import ExternalEntityLink from "./ExternalEntityLink";

export interface EntityNameProps {
    entity: Entity;
    repo: Repo;
    showLabel?: boolean;
}

export default (props: EntityNameProps) => {
    const { entity, repo, showLabel = false } = props;

    const entityLink = <ExternalEntityLink entity={entity} repo={repo} />;

    const popupBreadcrumb = <Popup flowing inverted hoverable trigger={entityLink}>
        <EntityAncestory entity={entity} size="medium" inverted />
    </Popup>;

    const inlineBreadcrumb = <div className="ui mini horizontal label right floated">
        <EntityAncestory entity={entity} size="mini" skipFirst skipLast />
    </div>;

    const ancestoryLength = entity.ancestory.length;
    const name = ancestoryLength > 1 ? popupBreadcrumb : entityLink;
    const label = ancestoryLength > 2 ? inlineBreadcrumb : undefined;
    const title = showLabel ? <>{name}{label}</> : name;

    return entity.exists
        ? title
        : <span style={{ color: "rgba(0,0,0,0.7)" }}>{title}</span>;
}