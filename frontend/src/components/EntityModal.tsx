import "bulma/css/bulma.css";
import React from "react";
import RepoDto from "../dtos/RepoDto";
import { Entity } from "../models/Entity";
import GithubLink from "./GithubLink";

export interface ItemModalProps {
    isVisible: boolean;
    entities: readonly Entity[];
    repo: RepoDto;
    close: () => void;
};

export default (props: ItemModalProps) => {
    if (!props.isVisible) {
        return <></>;
    }

    return <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">Entities</p>
            </header>
            <section className="modal-card-body">
                <div className="content">
                    <ol>{props.entities.map(e => <li key={e.id}><GithubLink item={e} repo={props.repo} /></li>)}</ol>
                </div>
            </section>
            <footer className="modal-card-foot">
                <button className="button" onClick={_ => props.close()}>Close</button>
            </footer>
        </div>
    </div>
}