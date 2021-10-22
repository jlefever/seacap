import _ from "lodash";
import React from "react";
import Change from "../models/Change";
import Entity from "../models/Entity";
import Repo from "../models/Repo";
import EntityListPopup from "./entity/EntityListPopup";
import ExternalCommitLink from "./entity/ExternalCommitLink";
import MyIcon from "./MyIcon";
import AttributeTable from "./AttributeTable";

export interface CommitViewProps {
    repo: Repo;
    commits: string[];
    getSources: (h: string) => readonly Entity[];
    getTargets: (h: string) => readonly Entity[];
}

export default (props: CommitViewProps) => {
    const { repo, commits, getSources, getTargets } = props;

    const items = new Map<string, React.ReactChild>();

    // const commits = _.union(sourceChanges.map(c => c.commitHash), targetChanges.map(c => c.commitHash));

    commits.forEach(hash => items.set(hash, <>
        <MyIcon name="vs-git-commit" />
        <ExternalCommitLink hash={hash} repo={repo} />
    </>));

    const getClients = (hash: string) => {
        // const myClients = sourceChanges.filter(c => c.commitHash === hash).map(c => c.entity);

        const myClients = getSources(hash);

        return <EntityListPopup
            trigger={<span>{myClients.length} clients</span>}
            entities={myClients}
            repo={repo}
        />;
    }

    const getInterfaces = (hash: string) => {
        // const myInterfaces = targetChanges.filter(c => c.commitHash === hash).map(c => c.entity);

        const myInterfaces = getTargets(hash);

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