import React from "react";
import HashDict from "../../base/dict/HashDict";
import Dep from "../../models/Dep";
import Repo from "../../models/Repo";
import CommitListPopup from "../entity/CommitListPopup";
import EntityIcon from "../entity/EntityIcon";
import EntityListPopup from "../entity/EntityListPopup";
import EntityName from "../entity/EntityName";
import MyIcon from "../MyIcon";
import { sortEntities } from "../util";

export interface ClientView {
    deps: Dep[];
    repo: Repo;
}

export default (props: ClientView) => {
    const { deps, repo } = props;

    return <div>
        {HashDict.groupBy(sortEntities(deps.map(d => d.source)), e => e.file).mapEntries((file, entities) => (
            <div className="ui basic segment" key={file.id}>
                <h4 className="ui horizontal divider header"><MyIcon name="vs-symbol-file" />{file.shortName}</h4>
                <table className="ui very basic table">
                    <tbody>
                        {entities.map(e => <tr key={e.id}>
                            <td><EntityIcon entity={e} /><EntityName entity={e} repo={repo} /></td>
                            <td className="collapsing">
                                <EntityListPopup
                                    trigger={<span>{deps.filter(d => d.source === e).length} uses</span>}
                                    entities={deps.filter(d => d.source === e).map(d => d.target)}
                                    repo={repo}
                                />
                            </td>
                            <td className="collapsing">
                                <CommitListPopup
                                    trigger={<span>{repo.changes.filter(c => c.entity === e).length} cochanges</span>}
                                    hashes={repo.changes.filter(c => c.entity === e).map(c => c.commitHash)}
                                    repo={repo}
                                />
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        ))}
    </div>
}