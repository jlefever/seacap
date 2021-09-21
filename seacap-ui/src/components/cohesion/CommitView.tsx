import _ from "lodash";
import React from "react";
import Change from "../../models/Change";
import Dep from "../../models/Dep";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import EntityListPopup from "../entity/EntityListPopup";
import ExternalCommitLink from "../entity/ExternalCommitLink";
import MyIcon from "../MyIcon";
import AttributeTable from "./AttributeTable";

export interface CommitViewProps {
    center: Entity;
    deps: Dep[];
    repo: Repo;
}

const getCommits = (center: Entity, clients: readonly Entity[], changes: readonly Change[]) => {
    const clientCommits = changes.filter(c => clients.includes(c.entity)).map(c => c.commitHash);
    const centerCommits = changes.filter(c => c.entity === center).map(c => c.commitHash);
    return _.intersection(clientCommits, centerCommits);
};

export default (props: CommitViewProps) => {
    const { deps, repo } = props;

    const clients = deps.map(d => d.source);
    const clientChanges = repo.changes.filter(c => clients.includes(c.entity));
    const clientCommits = clientChanges.map(c => c.commitHash);
    const interfaces = deps.map(d => d.target)
    const interfaceChanges = repo.changes.filter(c => interfaces.includes(c.entity));
    const interfaceCommits = interfaceChanges.map(c => c.commitHash);
    const commits = _.intersection(clientCommits, interfaceCommits);

    const items = new Map<string, React.ReactChild>();

    commits.forEach(hash => items.set(hash, <>
        <MyIcon name="vs-git-commit" />
        <ExternalCommitLink hash={hash} repo={repo} />
    </>));

    const getClients = (hash: string) => {
        const myClients = clientChanges.filter(c => c.commitHash === hash).map(c => c.entity);

        return <EntityListPopup
            trigger={<span>{myClients.length} clients</span>}
            entities={myClients}
            repo={repo}
        />;
    }

    const getInterfaces = (hash: string) => {
        const myInterfaces = interfaceChanges.filter(c => c.commitHash === hash).map(c => c.entity);

        return <EntityListPopup
            trigger={<span>{myInterfaces.length} interfaces</span>}
            entities={myInterfaces}
            repo={repo}
        />;
    }

    return <div className="ui basic segment">
        <AttributeTable items={items} attributes={[getClients, getInterfaces]} />
    </div>;
}