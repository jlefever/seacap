import React from "react";
import RepoDto from "../dtos/RepoDto";
import GithubTagLink from "./github/GithubTagLink";
import MyIcon from "./MyIcon";
import RepoPageLink from "./RepoPageLink";

interface RepoListProps {
    repos: readonly RepoDto[];
}

export default (props: RepoListProps) => (
    <div className="ui divided items">
        {props.repos.map(r => (
            <div key={r.id} className="item">
                <div className="content">
                    <RepoPageLink name={r.name} className="header">{r.name}</RepoPageLink>
                    <div className="meta">
                        <span>150 commits</span>
                        <span>&#183;</span>
                        <span>1543 files</span>
                        <span>&#183;</span>
                        <span>2113 entities</span>
                    </div>
                    <div className="description">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta venenatis lacus, sed auctor sem efficitur non. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.</p>
                    </div>
                    <div className="extra">
                        <GithubTagLink repoUrl={r.githubUrl} tag={r.leadRef} style={{ "color": "rgba(0, 0, 0, 0.4)" }} >
                            <MyIcon name="code branch" />{r.leadRef}
                        </GithubTagLink>
                    </div>
                </div>
            </div>
        ))}
    </div>
);