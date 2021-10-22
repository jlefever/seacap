import _ from "lodash";
import React, { useState } from "react";
import Repo from "../models/Repo";
import ExternalEntityLink from "./entity/ExternalEntityLink";

export interface FileNoticeProps {
    repo: Repo;
    filename: string;
}

export default function FileNotice(props: FileNoticeProps) {
    const { repo, filename } = props;
    const incomingDeps = repo.deps.filter(d => d.target.file.name === filename);
    const incomingFilenames = _.uniq(incomingDeps.map(d => d.source.file.name));
    const numIncoming = incomingFilenames.length;

    const commits = repo.changes.filter(c => c.entity.name === filename).map(c => c.commitHash);

    const cochange = (y: string) => _.intersection(
        commits,
        repo.changes.filter(c => c.entity.name === y).map(c => c.commitHash),
    ).length;

    const numChangeWith = incomingFilenames.filter(f => cochange(f) > 1).length;

    return <div className="ui message">
        <p><ExternalEntityLink repo={repo} entity={filename} /> has <strong>{numIncoming}</strong> file-level dependents and is evolutionarily coupled with <strong>{numChangeWith}</strong> of them.</p>
    </div>;
};