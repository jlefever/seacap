import React from "react";

export interface ClusterViewProps<T> {
    clusters: T[][]
    render: (cluster: T[]) => React.ReactChild;
}

function ClusterView<T>({ clusters, render }: ClusterViewProps<T>) {
    return <div>
        {clusters.map((cluster, i) => <div className="ui segment">
            {render(cluster)}
            <div className="ui top right attached medium label">Cluster {i + 1}</div>
        </div>)}
    </div>;
}

export default ClusterView;