import React, { ReactChild } from "react";
import { Popup } from "semantic-ui-react";
import Repo from "../../models/Repo";
import CommitItem from "./CommitItem";

export interface EntityListPopup {
    hashes: readonly string[];
    repo: Repo;
    trigger: ReactChild;
}

export default (props: EntityListPopup) => (
    <Popup flowing hoverable trigger={props.trigger} position="right center">
        <div className="ui middle aligned divided list">
            {props.hashes.map(h => <CommitItem key={h} hash={h} repo={props.repo} />)}
        </div>
    </Popup>
);