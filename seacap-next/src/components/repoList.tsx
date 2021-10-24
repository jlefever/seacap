import MyIcon from "components/myIcon";
import Repo from "models/repo";
import Link from "next/link";
import React from "react";

interface RepoListProps
{
    repos: Repo[];
}

const RepoList = ({ repos }: RepoListProps) =>
(
    <div className="ui divided items">
        {repos.map(repo => (
            <div key={repo.name} className="item">
                <div className="content">
                    <Link href={`/${encodeURIComponent(repo.name)}`}>
                        <a className="header">{repo.displayName}</a>
                    </Link>
                    <div className="meta">
                        <span>150 commits</span>
                        <span>&#183;</span>
                        <span>1543 files</span>
                        <span>&#183;</span>
                        <span>2113 entities</span>
                    </div>
                    <div className="description">
                        <p>{repo.description}</p>
                    </div>
                    <div className="extra">
                        <MyIcon name="code branch" />{repo.gitLeadRef}
                        {/* <GithubTagLink repoUrl={r.gitWeb} tag={r.gitLeadRef} style={{ "color": "rgba(0, 0, 0, 0.4)" }} >
                            <MyIcon name="code branch" />{r.gitLeadRef}
                        </GithubTagLink> */}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default RepoList;