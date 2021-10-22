import _ from "lodash";
import React from "react";
import HashDict from "../base/dict/HashDict";
import Entity from "../models/Entity";
import Repo from "../models/Repo";
import CommitListPopup from "./entity/CommitListPopup";
import EntityIcon from "./entity/EntityIcon";
import EntityListPopup from "./entity/EntityListPopup";
import EntityName from "./entity/EntityName";
import MyIcon from "./MyIcon";
import { sortEntities } from "./util";
import AttributeTable from "./AttributeTable";

export interface EntityViewProps {
    repo: Repo;
    entities: Entity[];
    relationName: string;
    getRelatedEntities: (e: Entity) => readonly Entity[];
    getCommitsFor: (e: Entity) => readonly string[];
}

export default (props: EntityViewProps) => {
    const { repo, entities, relationName, getRelatedEntities, getCommitsFor } = props;

    return <div>
        {HashDict.groupBy(sortEntities(entities), e => e.file).mapEntries((file, entities) => {
            const items = new Map<Entity, React.ReactChild>();

            entities.forEach(e => items.set(e,
                <>
                    <EntityIcon entity={e} />
                    <EntityName entity={e} repo={repo} />
                </>));

            const getUses = (e: Entity) => {
                const related = getRelatedEntities(e);

                return <EntityListPopup
                    trigger={<span>{related.length} {relationName}</span>}
                    entities={related}
                    repo={repo}
                />;
            }

            const getCommits = (e: Entity) => {
                const hashes = getCommitsFor(e);

                return <CommitListPopup
                    trigger={<span>{hashes.length} commits</span>}
                    hashes={hashes}
                    repo={repo}
                />;
            }

            return <div className="ui basic segment" key={file.id}>
                <h4 className="ui horizontal divider header"><MyIcon name="vs-symbol-file" />{file.shortName}</h4>
                <AttributeTable items={items} attributes={[getUses, getCommits]} />
            </div>
        })}
    </div>
}