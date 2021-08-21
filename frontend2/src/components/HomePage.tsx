import "@fortawesome/fontawesome-free/css/all.css";
import "bulma/css/bulma.css";
import React from "react";
import RepoDto from "../dtos/RepoDto";
import RepoPageLink from "./RepoPageLink";

interface HomePageProps {
    repoDtos: readonly RepoDto[];
}

export default class HomePage extends React.Component<HomePageProps> {
    constructor(props: HomePageProps) {
        super(props);
    }

    override render() {
        return <>
            <h1 className="title is-3">home</h1>
            <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Version</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.repoDtos.map(r => <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.name}</td>
                        <td>{r.leadRef}</td>
                        <td><RepoPageLink name={r.name}>repo</RepoPageLink></td>
                        {/* <td><Link to={`/${r.name}`}>anti-patterns</Link></td>
                        <td><Link to={`/${r.name}/maintenance`}>maintenance</Link></td> */}
                    </tr>)}
                </tbody>
            </table>
        </>;
    }
}