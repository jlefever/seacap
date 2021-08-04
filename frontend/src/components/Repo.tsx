import React from "react";

import "bulma/css/bulma.css";

export interface RepoProps {
    name: string;
};

export default (props: RepoProps) => {
    return <span>{props.name}</span>;
};