import React from "react";

import "bulma/css/bulma.css";
import RepoDto from "../dtos/RepoDto";

export interface RepoTableProps {
    repos: RepoDto[];
};

export default (props: RepoTableProps) => <table className="table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Version</th>
        </tr>
    </thead>
    <tbody>
        {props.repos.map(r => <tr>
            <td>{r.id}</td>
            <td>{r.name}</td>
            <td>{r.leadRef}</td>
        </tr>)}
    </tbody>
</table>