import React from "react";

interface RepoListProps {
    placeholders: number;
}

export default (props: RepoListProps) => (
    <div className="ui divided items">
        {Array.from(Array(props.placeholders).keys()).map(r => (
            <div key={r} className="item">
                <div className="content">
                    <div className="ui fluid placeholder">
                        <div className="paragraph">
                            <div className="line"></div>
                        </div>
                        <div className="paragraph">
                            <div className="line"></div>
                            <div className="line"></div>
                        </div>
                        <div className="paragraph">
                            <div className="line"></div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div >
);