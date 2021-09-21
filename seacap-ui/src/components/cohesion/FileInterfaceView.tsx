import _ from "lodash";
import React from "react";
import HashDict from "../../base/dict/HashDict";
import { hasChanged } from "../../clustering/preprocessors";
import Change from "../../models/Change";
import Dep from "../../models/Dep";
import Entity from "../../models/Entity";
import Repo from "../../models/Repo";
import CommitListPopup from "../entity/CommitListPopup";
import EntityIcon from "../entity/EntityIcon";
import EntityListPopup from "../entity/EntityListPopup";
import EntityName from "../entity/EntityName";
import MyIcon from "../MyIcon";
import { commonCommits, sortEntities } from "../util";
import AttributeTable from "./AttributeTable";

export interface FileInterfaceViewProps {
    deps: Dep[];
    changes: Change[];
    repo: Repo;
}

export default (props: FileInterfaceViewProps) => {
    const { deps, changes, repo } = props;

    return <div>
        {HashDict.groupBy(sortEntities(deps.map(d => d.target)), e => e.file).mapEntries((file, entities) => {
            const items = new Map<Entity, React.ReactChild>();

            entities.forEach(e => items.set(e,
                <>
                    <EntityIcon entity={e} />
                    <EntityName entity={e} repo={repo} />
                </>));

            const getClients = (e: Entity) => {
                const myClients = deps.filter(d => d.target === e).map(d => d.source);

                return <EntityListPopup
                    trigger={<span>{myClients.length} clients</span>}
                    entities={myClients}
                    repo={repo}
                />;
            }

            const getCommits = (e: Entity) => {
                const hashes = _.uniq(changes.filter(c => hasChanged(c, e)).map(c => c.commitHash));

                return <CommitListPopup
                    trigger={<span>{hashes.length} commits</span>}
                    hashes={hashes}
                    repo={repo}
                />;
            }

            return <div className="ui basic segment" key={file.id}>
                <h4 className="ui horizontal divider header"><MyIcon name="vs-symbol-file" />{file.shortName}</h4>
                <AttributeTable items={items} attributes={[getClients, getCommits]} />
            </div>
        })}
    </div>
}