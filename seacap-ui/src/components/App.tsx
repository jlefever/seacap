import React, { Component } from "react";
import { Link, Route, BrowserRouter, Switch } from "react-router-dom";
import RepoDto from "../models/RepoDto";
import RepoProvider from "../providers/RepoProvider";
import Loading from "./Loading";
import RepoPage from "./RepoPage";
import HomePage from "./HomePage";
import { getRepoPageRoute } from "./RepoPageLink";
import MyIcon from "./MyIcon";

import "./App.css";

interface AppState {
    repoDtos?: readonly RepoDto[];
}

export default class App extends Component<{}, AppState> {
    private readonly repoProvider: RepoProvider;

    constructor(props: {}) {
        super(props);
        this.state = {};
        this.repoProvider = new RepoProvider();
    }

    override componentDidMount() {
        this.repoProvider.getRepoDtos().then(repoDtos => this.setState({ repoDtos }));
    }

    override render() {
        return <BrowserRouter>
            <div className="ui inverted menu">
                <div className="ui container">
                    <Link to="/" className="header item">SEA Captain</Link>
                    <Link to="/" className="header item">Home</Link>
                    {/* <div className="ui simple dropdown item">
                        <MyIcon name="laptop code" />
                        <span>Projects</span>
                        <MyIcon name="dropdown" />
                        <div className="menu">
                            <a className="item" href="#">DeltaSpike</a>
                            <a className="item" href="#">Flume</a>
                        </div>
                    </div> */}
                </div>
            </div>
            <div className="main">
                <Switch>
                    {getRepoPageRoute(this.repoProvider)}
                    <Route path="/:name" render={props => (
                        <RepoPage provider={this.repoProvider} name={props.match.params.name} url={props.match.url} />
                    )} />
                    <Route exact path="/" render={_ => {
                        return <HomePage repos={this.state.repoDtos} />
                    }} />
                </Switch>
            </div>
            <footer className="ui fixed inverted vertical footer segment">
                <div className="ui center aligned container">
                    {/* <div className="ui stackable inverted divided grid">
                        <div className="three wide column">
                            <h4 className="ui inverted header">Group 1</h4>
                            <div className="ui inverted link list">
                                <a href="#" className="item">Link One</a>
                                <a href="#" className="item">Link Two</a>
                                <a href="#" className="item">Link Three</a>
                                <a href="#" className="item">Link Four</a>
                            </div>
                        </div>
                        <div className="three wide column">
                            <h4 className="ui inverted header">Group 2</h4>
                            <div className="ui inverted link list">
                                <a href="#" className="item">Link One</a>
                                <a href="#" className="item">Link Two</a>
                                <a href="#" className="item">Link Three</a>
                                <a href="#" className="item">Link Four</a>
                            </div>
                        </div>
                        <div className="three wide column">
                            <h4 className="ui inverted header">Group 3</h4>
                            <div className="ui inverted link list">
                                <a href="#" className="item">Link One</a>
                                <a href="#" className="item">Link Two</a>
                                <a href="#" className="item">Link Three</a>
                                <a href="#" className="item">Link Four</a>
                            </div>
                        </div>
                        <div className="seven wide column">
                            <h4 className="ui inverted header">Footer Header</h4>
                            <p>Extra space for a call to action inside the footer that could help re-engage users.</p>
                        </div>
                    </div> */}
                    {/* <div className="ui inverted section divider"></div> */}
                    {/* <img src="assets/images/logo.png" className="ui centered mini image" /> */}
                    <div className="ui horizontal inverted small divided link list">
                        <a className="item" href="#">Site Map</a>
                        <a className="item" href="#">Contact Us</a>
                        <a className="item" href="#">Terms and Conditions</a>
                        <a className="item" href="#">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </BrowserRouter>
    }
}