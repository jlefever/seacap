import React from "react";

import "bulma/css/bulma.css";

import HomePage from "./HomePage";
import Client from "../Client";
import { Link, Route, BrowserRouter, Switch } from "react-router-dom";

export interface Crumb {
    name: string;
    url: string;
};

export interface BreadcrumbProps {
    crumbs: Crumb[];
    current: string;
};

export default (props: BreadcrumbProps) => <nav className="breadcrumb" aria-label="breadcrumbs">
    <ul>
        {props.crumbs.map(c => <li key={c.url}><Link to={c.url}>{c.name}</Link></li>)}
        <li className="is-active"><Link to="#" aria-current="page">{props.current}</Link></li>
    </ul>
</nav>