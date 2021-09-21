import _ from "lodash";
import React from "react"
import MyMenu from "./MyMenu";

export interface QuantMenuProps {
    items: { [name: string]: number };
    active: string;
    onChange: (name: string) => void;
    color?: string;
}

export default (props: QuantMenuProps) => {
    const { items, ...rest } = props;

    const myItems = _.fromPairs(Object.entries(items).map(([name, quant]) => [
        name,
        (isActive: boolean, color: string) => isActive
            ? <div className={`ui ${color} left pointing label`}>{quant}</div>
            : <div className={`ui label`}>{quant}</div>
    ]));

    return <MyMenu items={myItems} {...rest} />
}