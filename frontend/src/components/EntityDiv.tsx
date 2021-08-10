import React from "react";

import "bulma/css/bulma.css";

import { Entity } from "../util";
import GithubLink from "./GithubLink";
import RepoDto from "../dtos/RepoDto";

export interface EntityDivProps {
    entity: Entity;
    repo: RepoDto;
};

export default (props: EntityDivProps) => {
    const ancestory = props.entity.ancestory;

    if (ancestory.length === 0) {
        return <nav></nav>;
    }

    if (ancestory.length === 1) {
        return <nav className="breadcrumb has-arrow-separator is-small">
            <ul>
                <li>
                    <GithubLink item={ancestory[0].name} repo={props.repo} />
                </li>
            </ul>
        </nav>
    }

    const file = ancestory[0];
    const current = ancestory[ancestory.length - 1];
    const middle = ancestory.slice(1, ancestory.length - 1);

    return <nav className="breadcrumb has-arrow-separator is-small">
        <ul>
            <li><GithubLink item={file.name} repo={props.repo} /></li>
            {middle.map(m => <li key={m.id} className="is-active"><a>{m.name}</a></li>)}
            <li className="is-active"><a>{current.name}</a></li>
        </ul>
    </nav>
};