import { useState } from 'react';
import { ExpansionPanel, ExpansionPanelContent } from '@progress/kendo-react-layout';
import { LayersTreeLayer } from './layers-tree-layer';


interface LayersTreeElementProps {
  item: LayerTreeItem,
  mapState: MapState,
  formID: FormID,
}


export const LayersTreeElement = ({item, mapState, formID}: LayersTreeElementProps) => {
  const [expanded, setExpanded] = useState(false);

  const itemToElement = (item: LayerTreeItem, i: number) => {
    return item.items
      ? <LayersTreeElement key={i} item={item} mapState={mapState} formID={formID} />
      : <LayersTreeLayer key={i} layer={item.sublayer} mapState={mapState} formID={formID} />
  };

  return (
    <ExpansionPanel
      expanded={expanded} style={{fontSize: '12px'}}
      title={item.text} tabIndex={0}
      onAction={() => {setExpanded(!expanded)}}
    >
      {expanded && <ExpansionPanelContent>{item.items?.map(itemToElement)}</ExpansionPanelContent>}
    </ExpansionPanel>
  );
};
