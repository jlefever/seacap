import _ from "lodash";
import React from "react"
import MyIcon, { IconSize } from "./MyIcon";
import MyMenu from "./MyMenu";

export interface IconMenuProps {
    items: { [name: string]: string };
    size?: IconSize;
    active: string;
    onChange: (name: string) => void;
    color?: string;
}

export default (props: IconMenuProps) => {
    const { items, size, ...rest } = props;

    const myItems = _.fromPairs(Object.entries(items).map(([name, icon]) => [
        name,
        (isActive: boolean, color: string) => isActive
            // @ts-ignore
            ? <MyIcon name={icon} size={size} color={color} />
            : <MyIcon name={icon} size={size} />
    ]));

    return <MyMenu items={myItems} {...rest} />
}