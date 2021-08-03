import React from "react";

import "bulma/css/bulma.css";

import Home from "./Home";
import RepoTable from "./RepoTable";
import Client from "../Client";

export default () => <section className="section mt-1 pt-1">
    <div className="container is-max-widescreen">
        <nav aria-label="main navigation" className="navbar is-white mt-5 mb-5" role="navigation">
            <div className="navbar-brand">
                <a className="navbar-item has-text-weight-bold" href="/">
                    <span>ICSE 2022</span>
                </a>
            </div>
        </nav>
        <Home />
        <footer className="footer has-background-white">
            <nav className="level">
                <div className="level-left">
                    <small className="level-item">Jason Lefever 2021</small>
                </div>
            </nav>
        </footer>
    </div>
</section>;