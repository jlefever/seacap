import _ from "lodash";
import React from "react";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import EntityIcon from "./EntityIcon";
import EntityName from "./EntityName";
import PathBreadcrumb from "./PathBreadcrumb";

interface EntityItemProps {
    entity: Entity;
    repo: Repo;
    showPath?: boolean;
    showLabel?: boolean;
}

export default (props: EntityItemProps) => {
    const { entity, repo, showPath = false } = props;

    const iconSize = showPath ? "big" : "large";

    return <div className="item">
        <EntityIcon entity={entity} size={iconSize} className="middle aligned" />
        <div className={`${showPath || "middle aligned"} content`}>
            <div className="header">
                <EntityName entity={entity} repo={repo} showLabel={props.showLabel} />
            </div>
            {showPath && <div className="description">
                <PathBreadcrumb path={entity.file.name} />
            </div>}
        </div>
    </div>
}