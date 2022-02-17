import React from 'react';
import {
    ExpansionPanel,
    ExpansionPanelContent,
} from "@progress/kendo-react-layout";
import SublayersTreeLayer from './SublayersTreeLayer';

export default function SublayersTreeElement(props) {
    const { formRef, item, formId } = props;
    const [expanded, setExpanded] = React.useState(false);

    return (<ExpansionPanel
        className="layerGroupPanel"
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
                subitem.items ? <SublayersTreeElement key={subitem.text} item={subitem} formRef={formRef} formId={formId} /> :
                    <SublayersTreeLayer key={subitem.text} subitem={subitem} formRef={formRef} formId={formId} />
            ))}
        </ExpansionPanelContent>}
    </ExpansionPanel>
    );
}