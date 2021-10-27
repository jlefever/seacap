import React from "react";

export interface ClusterViewProps<T>
{
    clusters: T[][];
    render: (cluster: T[]) => React.ReactChild;
}

function ClusterView<T>({ clusters, render }: ClusterViewProps<T>)
{
    if (clusters.length === 0)
    {
        // return <div className="ui placeholder segment">
        //     <div className="ui icon header">
        //         No clusters to show.
        //     </div>
        // </div>;
        return <p>No clusters to show.</p>
    }
    return <div>
        {clusters.map((cluster, i) => <div className="ui segment">
            {render(cluster)}
            <div className="ui top right attached medium label">Cluster {i + 1}</div>
        </div>)}
    </div>;
}

export default ClusterView;