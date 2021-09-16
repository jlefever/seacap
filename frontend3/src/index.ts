import "fomantic-ui-css/semantic.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { testKmeans } from "./tfext/kmeans";

await testKmeans();

const element = document.createElement("div");
element.setAttribute("id", "root");
document.body.appendChild(element);
ReactDOM.render(React.createElement(App), element);