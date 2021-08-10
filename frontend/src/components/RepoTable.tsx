import "@fortawesome/fontawesome-free/css/all.css";
import "bulma/css/bulma.css";
import React from "react";
import { Link } from "react-router-dom";
import Client from "../Client";
import RepoDto from "../dtos/RepoDto";
import Breadcrumb from "./Breadcrumb";

interface RepoTableState {
    repos: RepoDto[];
}

export default class RepoTable extends React.Component<{}, RepoTableState> {
    constructor(props: {}) {
        super(props);
        this.state = { repos: [] }
    }

    override componentDidMount() {
        new Client().getRepos().then(res => this.setState({ repos: res }));
    }

    override render() {
        return <>
            <h1 className="title is-3">home</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Version</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.repos.map(r => <tr key={r.id}>
                        <td>{r.id}</td>
                        <td><Link to={`/${r.name}`}>{r.name}</Link></td>
                        <td>{r.leadRef}</td>
                    </tr>)}
                </tbody>
            </table>
        </>;
    }
}