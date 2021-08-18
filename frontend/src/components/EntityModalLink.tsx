import "bulma/css/bulma.css";
import React from "react";
import RepoDto from "../dtos/RepoDto";
import { Entity } from "../models/Entity";
import EntityModal from "./EntityModal";

export interface ItemModalProps {
    entities: readonly Entity[];
    repo: RepoDto;
};

export interface ItemModalState {
    isModalVisible: boolean;
};

export default class ItemModal extends React.Component<ItemModalProps, ItemModalState> {
    constructor(props: ItemModalProps) {
        super(props);
        this.state = { isModalVisible: false };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    close() {
        this.setState({ isModalVisible: false });
    }

    open() {
        this.setState({ isModalVisible: true });
    }

    override render() {
        const { entities, repo } = this.props;
        const { isModalVisible } = this.state;

        return (<span>
            <a onClick={_ => this.open()}>{entities.length}</a>
            <EntityModal entities={entities} repo={repo} close={this.close} isVisible={isModalVisible} />
        </span>);
    }
};