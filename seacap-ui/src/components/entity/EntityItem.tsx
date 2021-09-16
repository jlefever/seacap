import _ from "lodash";
import React from "react";
import { Popup } from "semantic-ui-react";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import ExternalEntityLink from "./ExternalEntityLink";
import MyIcon from "../MyIcon";
import PathBreadcrumb from "./PathBreadcrumb";
import { entityIconFor } from "../util";
import EntityAncestory from "./EntityAncestory";

interface EntityItemProps {
    entity: Entity;
    repo: Repo;
    showPath?: boolean;
    showLabel?: boolean;
}

export default (props: EntityItemProps) => {
    const { entity, repo, showPath = false, showLabel = false } = props;

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

    const iconSize = showPath ? "big" : "large";

    const header = entity.exists
        ? (<div className="header">{title}</div>)
        : (<div className="header" style={{ color: "rgba(0,0,0,0.7)" }}>{title}</div>);

    return <div className="item">
        <Popup inverted flowing hoverable trigger={<MyIcon name={entityIconFor(entity.kind)} size={iconSize} className="middle aligned" />}>
            <div className="ui inverted">
                {entity.kind}
            </div>
        </Popup>
        <div className={`${showPath || "middle aligned"} content`}>
            {header}
            {showPath && <div className="description">
                <PathBreadcrumb path={entity.file.name} />
            </div>}
        </div>
    </div>
}


