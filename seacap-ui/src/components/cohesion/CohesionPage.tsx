import _ from "lodash";
import { F } from "ramda";
import React from "react";
import HashDict from "../../base/dict/HashDict";
import { EntityCluster } from "../../clustering/preprocessors";
import Dep from "../../models/Dep";
import Repo from "../../models/Repo";
import CommitListPopup from "../entity/CommitListPopup";
import EntityIcon from "../entity/EntityIcon";
import EntityItem from "../entity/EntityItem";
import EntityListPopup from "../entity/EntityListPopup";
import EntityName from "../entity/EntityName";
import MyIcon from "../MyIcon";
import { commonCommits, entityIconFor, sortEntities } from "../util";
import ClusterForm from "./ClusterForm";
import FileDropdown from "./FileDropdown";
import TabbedSegment from "./TabbedSegment";

export interface CohesionPageProps {
    repo: Repo
};

interface CohesionPageState {
    deps?: Dep[];
}

export default class CohesionPage extends React.Component<CohesionPageProps, CohesionPageState> {
    constructor(props: CohesionPageProps) {
        super(props);
        this.state = {};
    }

    override render() {
        const { repo } = this.props;

        return <>
            <div className="ui text container">
                <ClusterForm repo={this.props.repo} onSubmit={deps => this.setState({ deps })} />
                <div className="ui divider"></div>
            </div>
            <div className="ui text container">
                {this.state.deps && <div>
                    {HashDict.groupBy(sortEntities(this.state.deps.map(d => d.source)), e => e.file).mapEntries((file, entities) => (
                        <div className="ui basic segment" key={file.id}>
                            <h4 className="ui horizontal divider header"><MyIcon name="vs-symbol-file" />{file.shortName}</h4>
                            <table className="ui very basic table">
                                <tbody>
                                    {entities.map(e => <tr key={e.id}>
                                        <td><EntityIcon entity={e} /><EntityName entity={e} repo={repo} /></td>
                                        <td className="collapsing">
                                            <EntityListPopup
                                                trigger={<span>{this.state.deps!.filter(d => d.source === e).length} uses</span>}
                                                entities={this.state.deps!.filter(d => d.source === e).map(d => d.target)}
                                                repo={repo}
                                            />
                                        </td>
                                        <td className="collapsing">
                                            <CommitListPopup
                                                trigger={<span>{repo.changes.filter(c => c.entity === e).length} commits</span>}
                                                hashes={repo.changes.filter(c => c.entity === e).map(c => c.commitHash)}
                                                repo={repo}
                                            />
                                        </td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>}
            </div>
        </>
    }
}