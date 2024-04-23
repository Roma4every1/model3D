import { useState } from 'react';
import { ExpansionPanel, ExpansionPanelContent } from '@progress/kendo-react-layout';
import { LayerTreeLeaf } from './layer-tree-leaf';


interface LayersTreeElementProps {
  stage: IMapStage;
  item: LayerTreeItem;
}


export const LayerTreeNode = ({item, stage}: LayersTreeElementProps) => {
  const [expanded, setExpanded] = useState(false);

  const itemToElement = (item: LayerTreeItem, i: number) => {
    return item.items
      ? <LayerTreeNode key={i} item={item} stage={stage}/>
      : <LayerTreeLeaf key={i} layer={item.sublayer} stage={stage}/>;
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
