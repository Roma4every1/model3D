import React from 'react';
import { Splitter } from "@progress/kendo-react-layout";

export default function FormsContainer(props) {
    const onChange = (event) => {
        setPanes(event.newState);
    };
    var panes = [];
    for (var i = 0; i < props.children.length; i++) {
        panes.push({ resizable: true });
    }
    const [workPanes, setPanes] = React.useState(panes);
    if (props.children.length === 0) {
        return (<div />)
    }
    return (
        <Splitter onChange={onChange}
            style={{
                height: 650,
            }}
                panes={workPanes}
                orientation={"vertical"}
            >
            {props.children}
        </Splitter>
    );
}
