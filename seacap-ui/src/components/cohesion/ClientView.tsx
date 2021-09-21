import React from "react";
import HashDict from "../../base/dict/HashDict";
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

export interface ClientView {
    repo: Repo;
    center: Entity;
    deps: Dep[];
}

export default (props: ClientView) => {
    const { repo, center, deps } = props;

    return <div>
        {HashDict.groupBy(sortEntities(deps.map(d => d.source)), e => e.file).mapEntries((file, entities) => {
            const items = new Map<Entity, React.ReactChild>();

            entities.forEach(e => items.set(e,
                <>
                    <EntityIcon entity={e} />
                    <EntityName entity={e} repo={repo} />
                </>));

            const getUses = (e: Entity) => {
                const myDeps = deps.filter(d => d.source === e);

                return <EntityListPopup
                    trigger={<span>{myDeps.length} uses</span>}
                    entities={myDeps.filter(d => d.source === e).map(d => d.target)}
                    repo={repo}
                />;
            }

            const getCochanges = (e: Entity) => {
                const hashes = commonCommits(repo.changes, center, e);

                return <CommitListPopup
                    trigger={<span>{hashes.length} cochanges</span>}
                    hashes={hashes}
                    repo={repo}
                />;
            }

            return <div className="ui basic segment" key={file.id}>
                <h4 className="ui horizontal divider header"><MyIcon name="vs-symbol-file" />{file.shortName}</h4>
                <AttributeTable items={items} attributes={[getUses, getCochanges]} />
            </div>
        })}
    </div>
}