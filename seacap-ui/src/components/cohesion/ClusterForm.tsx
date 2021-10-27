import React from "react";
import { Dropdown } from "semantic-ui-react";

type ClusterAlg = "relational" | "spectral";

export interface ClusterOptions
{
    alg: ClusterAlg;
    normalized: boolean;
    numTotalClusters: number;
    numTargetClusters: number;
    numSourceClusters: number;
    numCommitClusters: number;
}

export interface ClusterFormProps
{
    value: ClusterOptions;
    loading: boolean;
    onChange: (value: ClusterOptions) => void;
    onSubmit: () => void;
}

export default (props: ClusterFormProps) =>
{
    const { value, loading, onChange, onSubmit } = props;

    const clusterButton = <div className="field">
        <button style={({ "height": "100%" })}
            className={`ui fluid basic ${loading ? "loading" : ""} button`}
            type="submit"
            onClick={() => onSubmit()}>
            Cluster
        </button>
    </div>;

    let inner = <div></div>;

    if (value.alg === "relational")
    {
        inner = <div className="four fields">
            <div className="field">
                <label># Interface Clusters</label>
                <div className="ui input">
                    <input type="number" min="1"
                        value={value.numTargetClusters}
                        onChange={e => onChange({ ...value, numTargetClusters: Number.parseInt(e.target.value) })} />
                </div>
            </div>
            <div className="field">
                <label># Client Clusters</label>
                <div className="ui input">
                    <input type="number" min="1"
                        value={value.numSourceClusters}
                        onChange={e => onChange({ ...value, numSourceClusters: Number.parseInt(e.target.value) })} />
                </div>
            </div>
            <div className="field">
                <label># Commit Clusters</label>
                <div className="ui input">
                    <input type="number" min="1"
                        value={value.numCommitClusters}
                        onChange={e => onChange({ ...value, numCommitClusters: Number.parseInt(e.target.value) })} />
                </div>
            </div>
            {clusterButton}
        </div>;
    }
    else
    {
        inner = <div className="four fields">
            <div className="field">
                <label>Objective</label>
                <Dropdown fluid selection
                    // @ts-ignore
                    onChange={(_, p) => onChange({ ...value, normalized: p.value })}
                    value={value.normalized}
                    options={[
                        { value: true, text: "Normalized Cut" },
                        { value: false, text: "Ratio Cut" }
                    ]} />
            </div>
            <div className="field">
                <label># Clusters</label>
                <div className="ui input">
                    <input type="number" min="1"
                        value={value.numTotalClusters}
                        onChange={e => onChange({ ...value, numTotalClusters: Number.parseInt(e.target.value) })} />
                </div>
            </div>
            <div className="field">
            </div>
            {clusterButton}
        </div>;
    }

    return <div className="ui form">
        <div className="field">
            <label>Algorithm</label>
            <Dropdown fluid selection
                // @ts-ignore
                onChange={(_, p) => onChange({ ...value, alg: p.value })}
                value={value.alg}
                options={[
                    { value: "relational", text: "Relational" },
                    { value: "spectral", text: "Spectral" }
                ]} />
        </div>
        {inner}
        <div className="ui divider"></div>
    </div>;
};

