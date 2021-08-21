import "@fortawesome/fontawesome-free/css/all.css";
import "bulma/css/bulma.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

const element = document.createElement("div");
element.setAttribute("id", "root");
document.body.appendChild(element);
ReactDOM.render(React.createElement(App), element);                        {/* <Route path="/:name/maintenance" render={props => {
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