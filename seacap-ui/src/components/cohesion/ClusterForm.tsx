import React, { useState } from "react";

export interface ClusterOptions {
    numTargetClusters: number;
    numSourceClusters: number;
    numCommitClusters: number;
}

export interface ClusterFormProps {
    onSubmit: (options: ClusterOptions) => void;
}

export default (props: ClusterFormProps) => {
    const [numTargetClusters, setNumTargetClusters] = useState(1);
    const [numSourceClusters, setNumSourceClusters] = useState(1);
    const [numCommitClusters, setNumCommitClusters] = useState(1);

    return <div className="ui form">
        <div className="four fields">
            <div className="field">
                <label># Interface Clusters</label>
                <div className="ui mini input">
                    <input type="number" min="1"
                        value={numTargetClusters}
                        onChange={e => setNumTargetClusters(Number.parseInt(e.target.value))} />
                </div>
            </div>
            <div className="field">
                <label># Client Clusters</label>
                <div className="ui mini input">
                    <input type="number" min="1"
                        value={numSourceClusters}
                        onChange={e => setNumSourceClusters(Number.parseInt(e.target.value))} />
                </div>
            </div>
            <div className="field">
                <label># Commit Clusters</label>
                <div className="ui mini input">
                    <input type="number" min="1"
                        value={numCommitClusters}
                        onChange={e => setNumCommitClusters(Number.parseInt(e.target.value))} />
                </div>
            </div>
            <div className="field">
                <button style={({ "height": "100%" })}
                    className="ui fluid violet basic button" type="submit" onClick={() => props.onSubmit({
                        numTargetClusters,
                        numSourceClusters,
                        numCommitClusters
                    })}>
                    Cluster
                </button>
            </div>
        </div>
    </div>
}

