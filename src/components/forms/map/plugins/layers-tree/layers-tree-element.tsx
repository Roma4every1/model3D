import { useState } from "react";
import { ExpansionPanel, ExpansionPanelContent } from "@progress/kendo-react-layout";
import { LayersTreeLayer } from "./layers-tree-layer";


interface LayersTreeElementProps {
  item: LayerTreeItem,
  mapState: MapState,
  formID: FormID,
}


export const LayersTreeElement = ({item, mapState, formID}: LayersTreeElementProps) => {
  const [expanded, setExpanded] = useState(false);

  const mapItems = (item: LayerTreeItem) => {
    return item.items
      ? <LayersTreeElement key={item.text} item={item} mapState={mapState} formID={formID} />
      : <LayersTreeLayer key={item.text} layer={item.sublayer} mapState={mapState} formID={formID} />
  };

  return (
    <ExpansionPanel
      className={'layerGroupPanel'} expanded={expanded}
      title={item.text} tabIndex={0}
      onAction={() => {setExpanded(!expanded)}}
    >
      {expanded && <ExpansionPanelContent>{item.items?.map(mapItems)}</ExpansionPanelContent>}
    </ExpansionPanel>
  );
};
