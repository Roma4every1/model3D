import { useState } from 'react';
import { MapStage } from 'features/map/lib/map-stage';
import { MapLayer } from 'features/map/lib/map-layer';
import { ExpansionPanel, ExpansionPanelContent } from '@progress/kendo-react-layout';
import { LayerTreeLeaf } from 'features/map/components/layer-tree/layer-tree-leaf';


interface ProfileLayerListProps {
  stage: MapStage;
}


export const ProfileLayerList = ({stage}: ProfileLayerListProps) => {
  const [expanded, setExpanded] = useState(false);
  const layers = stage?.getMapData()?.layers;

  const itemToElement = (item: MapLayer, i: number) => {
    return <LayerTreeLeaf key={i} layer={item} stage={stage}/>;
  };

  return <ExpansionPanel
    expanded={expanded} style={{fontSize: '14px'}}
    title={'Слои'} tabIndex={0}
    onAction={() => {setExpanded(!expanded)}}
  >
    {expanded && <ExpansionPanelContent>
      {layers?.length ? layers.map(itemToElement) : <></>}
    </ExpansionPanelContent>}
  </ExpansionPanel>
};
