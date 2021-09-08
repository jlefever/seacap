import React, { useState } from "react";
import { EntityCluster } from "../../clustering/preprocessors";
import Repo from "../../models/Repo";
import ExternalEntityLink from "../ExternalEntityLink";

import "./ClusterTree.css";

export interface ClusterTreeProps {
    repo: Repo;
    cluster: EntityCluster;
    clusterPath: string;
}

export default function ClusterTree(props: ClusterTreeProps) {
    const { repo, cluster, clusterPath } = props;

    const [isHovered, setIsHovered] = useState(false);

    function getClassName() {
        return isHovered ? "has-background-primary-light" : "";
    }

    if (cluster.value !== undefined) {
        return <ExternalEntityLink repo={repo} entity={cluster.value!.tag} />
    }

    return <div className={`cluster-tree ${getClassName()}`}>
        <div onMouseEnter={_ => {setIsHovered(true);}} onMouseLeave={_ => {setIsHovered(false);}}>Cluster {parseInt(clusterPath, 2)}</div>
        <ul>
            {cluster.children.map((c, i) => (
                <li key={i}><ClusterTree repo={repo} cluster={c} clusterPath={clusterPath + "" + i} /></li>
            ))}
        </ul>
    </div>;
};