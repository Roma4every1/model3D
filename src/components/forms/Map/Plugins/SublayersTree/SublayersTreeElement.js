import React, { useState } from "react";
import { ExpansionPanel, ExpansionPanelContent } from "@progress/kendo-react-layout";
import SublayersTreeLayer from "./SublayersTreeLayer";

export default function SublayersTreeElement({item, formId}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ExpansionPanel
      className={'layerGroupPanel'}
      title={item.text}
      tabIndex={0}
      expanded={expanded}
      key={item.id}
      onAction={() => {setExpanded(!expanded)}}
    >
      {expanded &&
        <ExpansionPanelContent>
          {item.items?.map((subItem) => (
            subItem.items
              ? <SublayersTreeElement key={subItem.text} item={subItem} formId={formId} />
              : <SublayersTreeLayer key={subItem.text} subitem={subItem} formId={formId} />
          ))}
        </ExpansionPanelContent>
      }
    </ExpansionPanel>
  );
}
