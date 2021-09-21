import React from "react"

export interface MyMenuProps {
    items: { [name: string]: (isActive: boolean, color: string) => React.ReactChild };
    active: string;
    onChange: (name: string) => void;
    color?: string;
}

export default (props: MyMenuProps) => {
    const { items, active, onChange, color = "teal" } = props;

    const getItemClass = (name: string) => name === active
        ? `active ${color} item`
        : "item";

    const getLabelClass = (name: string) => name === active
        ? `ui ${color} left pointing label`
        : "ui label";

    const onClick = (e: React.SyntheticEvent, name: string) => {
        e.preventDefault();

        if (name !== active) {
            onChange(name);
        }
    }

    return <div className="ui fluid secondary vertical pointing menu">
        {Object.entries(items).map(([name, fn]) =>
            <a className={getItemClass(name)} key={name} onClick={e => onClick(e, name)}>
                {name}
                {fn(name === active, color)}
            </a>)}
    </div>
}