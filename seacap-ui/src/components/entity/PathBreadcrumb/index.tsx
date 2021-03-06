import _ from "lodash";
import React from "react";
import "./index.css";

interface PathBreadcrumb {
    path: string;
}

function intersperse<T>(arr: T[], delimiter: T): T[] {
    return _.flatMap(arr, (x, i) => i > 0 ? [delimiter, x] : [x]);
}

export default (props: PathBreadcrumb) => (
    <div className="ui mini breadcrumb path-breadcrumb">
        {intersperse(_.reverse(props.path.split("/")).map(s => <div className="section path-breadcrumb-section">{s}</div>), <span className="divider">/</span>)}
    </div>
);