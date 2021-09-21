import React, { ReactChild } from "react";
import { Popup } from "semantic-ui-react";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import { sortEntities } from "../util";
import EntityItem from "./EntityItem";

export interface EntityListPopup {
    entities: readonly Entity[];
    repo: Repo;
    trigger: ReactChild;
}

export default (props: EntityListPopup) => {
    if (props.entities.length === 0) {
        return <>{props.trigger}</>;
    }

    const entities = sortEntities(props.entities);

    return <Popup flowing hoverable trigger={props.trigger} position="left center">
        <div className="ui middle aligned divided list">
            {entities.map((e, i) => <EntityItem key={i} entity={e} repo={props.repo} />)}
        </div>
    </Popup>
}