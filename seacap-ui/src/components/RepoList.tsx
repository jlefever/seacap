import React from "react";
import RepoDto from "../models/RepoDto";
import GithubTagLink from "./github/GithubTagLink";
import MyIcon from "./MyIcon";
import RepoPageLink from "./RepoPageLink";

interface RepoListProps {
    repos: readonly RepoDto[];
}

export default (props: RepoListProps) => (
    <div className="ui divided items">
        {props.repos.map(r => (
            <div key={r.name} className="item">
                <div className="content">
                    <RepoPageLink name={r.name} className="header">{r.displayName}</RepoPageLink>
                    <div className="meta">
                        <span>150 commits</span>
                        <span>&#183;</span>
                        <span>1543 files</span>
                        <span>&#183;</span>
                        <span>2113 entities</span>
                    </div>
                    <div className="description">
                        <p>{r.description}</p>
                    </div>
                    <div className="extra">
                        <GithubTagLink repoUrl={r.gitWeb} tag={r.gitLeadRef} style={{ "color": "rgba(0, 0, 0, 0.4)" }} >
                            <MyIcon name="code branch" />{r.gitLeadRef}
                        </GithubTagLink>
                    </div>
                </div>
            </div>
        ))}
    </div>
);