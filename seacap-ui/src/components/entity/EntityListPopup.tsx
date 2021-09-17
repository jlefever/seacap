import React, { ReactChild } from "react";
import { Popup } from "semantic-ui-react";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import EntityItem from "./EntityItem";

export interface EntityListPopup {
    entities: readonly Entity[];
    repo: Repo;
    trigger: ReactChild;
}

export default (props: EntityListPopup) => (
    <Popup flowing hoverable trigger={props.trigger} position="left center">
        <div className="ui middle aligned divided list">
            {props.entities.map((e, i) => <EntityItem key={i} entity={e} repo={props.repo} />)}
        </div>
    </Popup>
);