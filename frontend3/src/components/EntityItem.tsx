import _ from "lodash";
import React from "react";
import { Popup } from "semantic-ui-react";
import Entity from "../models/Entity";
import Repo from "../models/Repo";
import ExternalEntityLink from "./ExternalEntityLink";
import MyIcon from "./MyIcon";
import PathBreadcrumb from "./PathBreadcrumb";
import { entityIconFor } from "./util";

interface EntityItemProps {
    entity: Entity;
    repo: Repo;
}

export default (props: EntityItemProps) => <div className="item">
    <Popup inverted flowing hoverable trigger={
        <MyIcon name={entityIconFor(props.entity.kind)} size="big" className="middle aligned" />
    }>
        <div className="ui inverted">
            {props.entity.kind}
        </div>
    </Popup>
    <div className="content">
        <Popup inverted flowing hoverable trigger={
            props.entity.exists
                ? (<div className="header">
                    <ExternalEntityLink entity={props.entity} repo={props.repo} />
                </div>)
                : (<div className="header" style={{ color: "rgba(0,0,0,0.7)" }}>
                    <MyIcon name="trash" size="small" />
                    <ExternalEntityLink entity={props.entity} repo={props.repo} />
                </div>)
        }>
            <div className="ui inverted breadcrumb">
                {props.entity.kind}
            </div>
        </Popup>
        <div className="description">
            <PathBreadcrumb path={props.entity.file.name} />
        </div>
    </div>
</div>