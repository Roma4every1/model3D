import React from 'react';
import {
    ExpansionPanel,
    ExpansionPanelContent,
} from "@progress/kendo-react-layout";
import SublayersTreeLayer from './SublayersTreeLayer';

export default function SublayersTreeElement(props) {
    const { formRef, item } = props;
    const [expanded, setExpanded] = React.useState(false);

    return (<ExpansionPanel
        title={item.text}
        tabIndex={0}
        expanded={expanded}
        key={item.id}
        onAction={(event) => {
            setExpanded(!expanded);
        }}
    >
        {expanded && <ExpansionPanelContent>
            {item.items?.map((subitem) => (
                subitem.items ? <SublayersTreeElement item={subitem} formRef={formRef} /> :
                    <SublayersTreeLayer subitem={subitem} formRef={formRef} />
            ))}
        </ExpansionPanelContent>}
    </ExpansionPanel>
    );
}