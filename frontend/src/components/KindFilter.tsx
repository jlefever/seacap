import React from "react";

import "bulma/css/bulma.css";
import _ from "lodash";
import CheckboxList from "./CheckboxList";

export interface KindFilterProps {
    kinds: string[];
    selected: string[];
    setSelected: (selected: string[]) => void;
};

export default ({ kinds, selected, setSelected }: KindFilterProps) => (
    <CheckboxList
        pairs={_.map(kinds, k => [k, selected.includes(k)])}
        setValue={(name, value) => {
            if (value) {
                setSelected(_.union(selected, [name]));
            } else {
                setSelected(_.filter(selected, s => s !== name));
            }
        }} />
);