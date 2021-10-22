import _ from "lodash";
import React, { useEffect } from "react";
import { Dropdown } from "semantic-ui-react";
import HashDict from "../base/dict/HashDict";
import Repo from "../models/Repo";

export interface FileDropdownProps {
    repo: Repo;
    onSelect: (filename: string) => void;
}

export default (props: FileDropdownProps) => {
    const pairs = HashDict.groupBy(props.repo.deps, d => d.target.file).pairs();
    const ordered = _.orderBy(pairs, ([, vs]) => _.uniq(vs.map(v => v.source.file)).length, "desc");

    useEffect(() => props.onSelect(ordered[0][0].name), []);

    const options = ordered.map(([file, _]) => ({ key: file.id, value: file.name, text: file.name }));

    return <Dropdown
        placeholder="Select a File"
        fluid search selection
        options={options}
        defaultValue={ordered[0][0].name}
        onChange={(_, p) => props.onSelect(p.value as string)} />
};