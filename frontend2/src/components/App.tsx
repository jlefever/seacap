import React, { Component } from "react";
import { Link, Route, BrowserRouter, Switch } from "react-router-dom";
import RepoDto from "../dtos/RepoDto";
import RepoProvider from "../providers/RepoProvider";
import Loading from "./Loading";
import RepoPage from "./RepoPage";
import HomePage from "./HomePage";
import { getRepoPageRoute } from "./RepoPageLink";

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
        return <section className="section mt-1 pt-1">
            <BrowserRouter>
                <div className="container is-fullhd">
                    <nav aria-label="main navigation" className="navbar is-white mt-5 mb-5" role="navigation">
                        <div className="navbar-brand">
                            <Link to="/" className="navbar-item has-text-weight-bold"><span>ICSE 2022</span></Link>
                        </div>
                    </nav>
                    <Switch>
                        {/* <Route path="/:name/maintenance" render={props => {
                            return <MaintPage repoName={props.match.params.name} />;
                        }} />
                        <Route path="/:name/crossing-:num" render={props => {
                            return <CrsDash repoName={props.match.params.name} num={parseInt(props.match.params.num)} />
                        }} />
                        <Route path="/:name/unstable-interface-:num" render={props => {
                            return <UifDash repoName={props.match.params.name} num={parseInt(props.match.params.num)} />
                        }} />
                        <Route path="/:name/mvp-:num" render={props => {
                            return <MvpDash repoName={props.match.params.name} num={parseInt(props.match.params.num)} />
                        }} />
                        <Route path="/:name/clique-:num" render={props => {
                            return <ClqDash repoName={props.match.params.name} num={parseInt(props.match.params.num)} />
                        }} />
                        <Route path="/:name" render={props => {
                            return <Repo name={props.match.params.name} url={props.match.url} />;
                        }} /> */}
                        {getRepoPageRoute(this.repoProvider)}
                        <Route path="/:name" render={props => (
                            <RepoPage provider={this.repoProvider} name={props.match.params.name} url={props.match.url} />
                        )} />
                        <Route exact path="/" render={_ => {
                            if (this.state.repoDtos === undefined) {
                                return <Loading />;
                            }
                            return <HomePage repoDtos={this.state.repoDtos} />
                        }} />
                    </Switch>
                </div>
            </BrowserRouter>
        </section>;
    }
}