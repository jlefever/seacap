import _ from "lodash";
import React from "react";
import { SemanticSIZES } from "semantic-ui-react";
import Entity from "../../models/Entity";
import MyIcon from "../MyIcon";
import { entityIconFor } from "../util";

interface EntityAncestoryProps {
    entity: Entity;
    skipFirst?: boolean;
    skipLast?: boolean;
    inverted?: boolean;
    size: SemanticSIZES;
}

function intersperse<T>(arr: T[], delimiter: T): T[] {
    return _.flatMap(arr, (x, i) => i > 0 ? [delimiter, x] : [x]);
}

export default (props: EntityAncestoryProps) => {
    let ancestory = props.entity.ancestory;

    if (props.skipFirst) {
        ancestory = _.drop(ancestory);
    }

    if (props.skipLast) {
        ancestory = _.dropRight(ancestory);
    }

    const inverted = props.inverted ? "inverted" : "";

    const sections = ancestory.map(e => <>
        <MyIcon name={entityIconFor(e.kind)} inverted={props.inverted} />
        <span className={`section ${inverted}`}>{e.shortName}</span>
    </>);

    return <div className={`ui breadcrumb ${props.size} ${inverted}`}>
        {intersperse(sections, <i className={`right chevron icon divider ${inverted}`} />)}
    </div>;
}

