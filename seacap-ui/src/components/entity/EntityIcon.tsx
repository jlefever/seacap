import React from "react";
import { Popup } from "semantic-ui-react";
import Entity from "../../models/Entity";
import MyIcon, { IconSize } from "../MyIcon";
import { entityIconFor } from "../util";

export interface EntityIconProps {
    entity: Entity;
    size?: IconSize;
    inverted?: boolean;
    className?: string;
}

export default (props: EntityIconProps & React.HTMLAttributes<HTMLElement>) => {
    const { entity, size, inverted, className } = props;
    return <Popup inverted flowing hoverable trigger={<MyIcon name={entityIconFor(entity.kind)} size={size} inverted={inverted} className={className} />}>
        <div className="ui inverted">
            {entity.kind}
        </div>
    </Popup>
}