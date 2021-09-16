import _ from "lodash";
import * as R from "ramda";
import React, { useEffect } from "react";
import HashDict from "../../base/dict/HashDict";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";

export interface FileDropdownProps {
    repo: Repo;
    onSelect: (filename: string) => void;
}

export default (props: FileDropdownProps) => {
    // const files = R.compose<Entity[], Entity[], Entity[], Entity[]>(
    //     R.reverse,
    //     R.sortBy(e => e.linenos![1]),
    //     R.filter<Entity>(e => e.kind === "file" && e.linenos !== null)
    // )([...props.repo.entities]);

    const pairs = HashDict.groupBy(props.repo.deps, d => d.target.file).pairs();
    const ordered = _.orderBy(pairs, ([, vs]) => _.uniq(vs.map(v => v.source.file)).length, "desc");

    useEffect(() => props.onSelect(ordered[0][0].name), []);

    return <span className="select is-fullwidth">
        <select onChange={e => props.onSelect(e.target.value)}>
            {ordered.map(([f, _]) => <option key={f.id} value={f.name}>{f.name}</option>)}
        </select>
    </span>;
};