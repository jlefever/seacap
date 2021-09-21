import _ from "lodash";
import React from "react";
import Change from "../../models/Change";
import Repo from "../../models/Repo";
import EntityListPopup from "../entity/EntityListPopup";
import ExternalCommitLink from "../entity/ExternalCommitLink";
import MyIcon from "../MyIcon";
import AttributeTable from "./AttributeTable";

export interface CommitViewProps {
    sourceChanges: Change[];
    targetChanges: Change[];
    repo: Repo;
}

export default (props: CommitViewProps) => {
    const { sourceChanges, targetChanges, repo } = props;

    // const clients = deps.map(d => d.source);
    // const clientChanges = repo.changes.filter(c => transInclude(clients, c.entity));
    // const clientCommits = clientChanges.map(c => c.commitHash);
    // const interfaces = deps.map(d => d.target);
    // const interfaceChanges = repo.changes.filter(c => transInclude(interfaces, c.entity));
    // const interfaceCommits = interfaceChanges.map(c => c.commitHash);
    // const commits = _.intersection(clientCommits, interfaceCommits);

    const items = new Map<string, React.ReactChild>();

    const commits = _.union(sourceChanges.map(c => c.commitHash), targetChanges.map(c => c.commitHash));

    commits.forEach(hash => items.set(hash, <>
        <MyIcon name="vs-git-commit" />
        <ExternalCommitLink hash={hash} repo={repo} />
    </>));

    const getClients = (hash: string) => {
        const myClients = sourceChanges.filter(c => c.commitHash === hash).map(c => c.entity);

        return <EntityListPopup
            trigger={<span>{myClients.length} clients</span>}
            entities={myClients}
            repo={repo}
        />;
    }

    const getInterfaces = (hash: string) => {
        const myInterfaces = targetChanges.filter(c => c.commitHash === hash).map(c => c.entity);

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