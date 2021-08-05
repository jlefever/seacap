import "bulma/css/bulma.css";
import _ from "lodash";
import React from "react";
import Client from "../Client";
import RepoDto from "../dtos/RepoDto";
import UifDto from "../dtos/UifDto";
import { createChanges, createDeps, createEntities, isM2m } from "../util";
import Breadcrumb from "./Breadcrumb";
import GithubLink from "./GithubLink";

export interface UifDashProps {
    repoName: string;
    num: number;
};

interface UifDashState {
    repo?: RepoDto;
    uif?: UifDto;
}

export default class UifDash extends React.Component<UifDashProps, UifDashState> {
    constructor(props: UifDashProps) {
        super(props);
        this.state = {};
    }

    override componentDidMount() {
        const client = new Client();
        client.getRepo(this.props.repoName).then(repo => this.setState({ repo }));
        client.getUif(this.props.repoName, this.props.num).then(uif => this.setState({ uif }));
    }

    override render() {
        const { repoName, num } = this.props;
        const { uif, repo } = this.state;
        const name = `unstable-interface-${num}`;

        const header = <>
            <h1 className="title is-3">{name}</h1>
            <Breadcrumb crumbs={[{ name: "home", url: "/" }, { name: repoName, url: `/${repoName}` }]} current={name} />
        </>;

        if (!uif || !repo) {
            return <>{header}<span>Loading...</span></>;
        }

        const { summary: sum } = uif;

        const entities = createEntities(uif.entities);
        const changes = createChanges(entities, uif.changes);
        const inDeps = createDeps(entities, uif.inDeps);
        const evoInDeps = createDeps(entities, uif.evoInDeps);

        // console.log(entities);
        // console.log(inDeps);
        // console.log(outDeps);

        const evoInFiles = [...new Set(evoInDeps.map(d => d.source.file))];

        const calledByMethods = _.groupBy(evoInDeps.filter(isM2m), d => d.target.id);

        return <>
            {header}
            <h2 className="title is-4">Description</h2>
            <div className="content">
                The file <strong><GithubLink path={sum.tgt} repo={repo} /></strong> is depended on by <strong>{sum.fanin}</strong> files and has co-changed at least twice with <strong>{sum.evoFanin}</strong> of them. So this is an unstable interface with a total of <strong>{sum.size}</strong> files.
            </div>

            <div className="columns">
                <div className="column">
                    <h2 className="title is-6"><abbr title="evolutionarily coupled (co-changed at least twice)">Evo.</abbr> Incoming Files</h2>
                    <ul>{evoInFiles.map(f => <li key={f.id}><GithubLink path={f.name} repo={repo} /></li>)}</ul>
                </div>
            </div>

            <h2 className="title is-4">Concentration</h2>
            <div className="content">
                This file has <strong>X</strong> methods, <strong>Y</strong> of which are called by a method in a file which is evolutionarily coupled with this unstable interface.
            </div>
            <div className="columns">
                <div className="column">
                    <h2 className="title is-6">Incoming Calls</h2>
                    <ul>{Object.entries(calledByMethods).map(e => <li key={e[0]}>{entities.get(parseInt(e[0]))?.name} <span>(called by <strong>{e[1].length}</strong> methods)</span></li>)}</ul>
                </div>
            </div>

            <h2 className="title is-4">Alignment</h2>
            <div className="content">
                The following method-to-method dependencies have co-changed at least once. Or in other words, these dependencies are structurally and historically aligned with the file-level unstable interface.
            </div>
            <div className="columns">
                <div className="column">
                    <h2 className="title is-6">Incoming Calls</h2>
                    <ul>
                        {evoInDeps.filter(isM2m).map(d => (
                            <li>
                                {d.source.name}
                                <span className="icon"><i className="fas fa-arrow-right"></i></span>
                                {d.target.name} (co-changed <strong>{d.source.cocommits(d.target).length}</strong> times)
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>;
    }
}