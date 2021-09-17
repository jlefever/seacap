import React, { ReactNode } from "react";
import { Tab } from "semantic-ui-react";

export interface Pane {
    menuItem: string;
    render: () => ReactNode;
}

export interface TabbedPaneProps {
    name: ReactNode;
    panes: Pane[];
}

export default (props: TabbedPaneProps) => {
    return <div className="ui segment">
        <Tab menu={{ secondary: true, pointing: true }} panes={props.panes} />
        <h2 className="ui top right attached medium label">{props.name}</h2>
    </div>
}