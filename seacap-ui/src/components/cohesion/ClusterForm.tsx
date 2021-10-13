import React from "react";

export interface ClusterOptions {
    numTargetClusters: number;
    numSourceClusters: number;
    numCommitClusters: number;
}

export interface ClusterFormProps {
    value: ClusterOptions;
    onChange: (value: ClusterOptions) => void;
    onSubmit: () => void;
}

export default (props: ClusterFormProps) => {
    const { value, onChange, onSubmit } = props;

    return <div className="ui form">
        <div className="four fields">
            <div className="field">
                <label># Interface Clusters</label>
                <div className="ui mini input">
                    <input type="number" min="1"
                        value={value.numTargetClusters}
                        onChange={e => onChange({ ...value, numTargetClusters: Number.parseInt(e.target.value) })} />
                </div>
            </div>
            <div className="field">
                <label># Client Clusters</label>
                <div className="ui mini input">
                    <input type="number" min="1"
                        value={value.numSourceClusters}
                        onChange={e => onChange({ ...value, numSourceClusters: Number.parseInt(e.target.value) })} />
                </div>
            </div>
            <div className="field">
                <label># Commit Clusters</label>
                <div className="ui mini input">
                    <input type="number" min="1"
                        value={value.numCommitClusters}
                        onChange={e => onChange({ ...value, numCommitClusters: Number.parseInt(e.target.value) })} />
                </div>
            </div>
            <div className="field">
                <button style={({ "height": "100%" })}
                    className="ui fluid violet basic button"
                    type="submit"
                    onClick={() => onSubmit()}>
                    Cluster
                </button>
            </div>
        </div>
    </div>
}

