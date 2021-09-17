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

function intersperse(arr: JSX.Element[], getDelimiter: (i: number) => JSX.Element): JSX.Element[] {
    return _.flatMap(arr, (x, i) => i > 0 ? [getDelimiter(i), x] : [x]);
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
        <MyIcon key={`icon-${e.id}`} name={entityIconFor(e.kind)} inverted={props.inverted} />
        <span key={`name-${e.id}`} className={`section ${inverted}`}>{e.shortName}</span>
    </>);

    const getDelimiter = (i: number) => (
        <i key={`del-${i}`} className={`right chevron icon divider ${inverted}`} />
    );

    return <div className={`ui breadcrumb ${props.size} ${inverted}`}>
        {intersperse(sections, getDelimiter)}
    </div>;
}

