import React from "react";

import "bulma/css/bulma.css";

import RepoTable from "./RepoTable";
import Client from "../Client";
import { Link, Route, BrowserRouter, Switch } from "react-router-dom";
import Repo from "./Repo";
import CrsDash from "./CrsDash";
import UifDash from "./UifDash";

export default () => <section className="section mt-1 pt-1">
    <BrowserRouter>
        <div className="container is-max-widescreen">
            <nav aria-label="main navigation" className="navbar is-white mt-5 mb-5" role="navigation">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-item has-text-weight-bold"></Link>
                    <a className="navbar-item has-text-weight-bold" href="/">
                        <span>ICSE 2022</span>
                    </a>
                </div>
            </nav>

            <Switch>
                <Route path="/:name/crossing-:num" render={props => {
                    return <CrsDash repoName={props.match.params.name} num={parseInt(props.match.params.num)} />
                }} />
                <Route path="/:name/unstable-interface-:num" render={props => {
                    return <UifDash repoName={props.match.params.name} num={parseInt(props.match.params.num)} />
                }} />
                <Route path="/:name" render={props => {
                    return <Repo name={props.match.params.name} url={props.match.url} />;
                }} />
                <Route path="/" render={_ => <RepoTable />} />
            </Switch>

            {/* <footer className="footer has-background-white">
                <nav className="level">
                    <div className="level-left">
                        <small className="level-item">Jason Lefever 2021</small>
                    </div>
                </nav>
            </footer> */}
        </div>
    </BrowserRouter>
</section>;