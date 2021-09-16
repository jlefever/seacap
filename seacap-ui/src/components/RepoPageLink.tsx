import React from "react";
import { Link, Route } from "react-router-dom";
import RepoProvider from "../providers/RepoProvider";
import RepoPage from "./RepoPage";

export interface RepoPageLinkProps {
    name: string;
    children: string;
};

export default (props: RepoPageLinkProps & React.HTMLAttributes<HTMLAnchorElement>) => (
    <Link to={`/${props.name}`} {...{ ...props, name: undefined }}>{props.children}</Link>
);

export function getRepoPageRoute(provider: RepoProvider) {
    return <Route path="/:name" render={props => (
        <RepoPage provider={provider} name={props.match.params.name} url={props.match.url} />
    )} />;
}