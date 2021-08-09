import React from "react";

import "bulma/css/bulma.css";
import "./index.css";
import _ from "lodash";

export interface CheckboxListProps {
    pairs: Array<[string, boolean]>;
    setValue: (name: string, value: boolean) => void;
};

export default (props: CheckboxListProps) => <div className="checkbox-list">
    {_.map(props.pairs, ([name, value]) => <div className="checkbox-list-item">
        <label htmlFor={name} className="checkbox">
            <input id={name} name={name} type="checkbox" checked={value} onChange={e => props.setValue(name, e.target.checked)} />
            <span className="pl-1">{name}</span>
        </label>
    </div>)}
</div>;