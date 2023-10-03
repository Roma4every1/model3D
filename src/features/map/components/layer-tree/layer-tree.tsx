import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LayerTreeNode } from './layer-tree-node.tsx';
import { mapStateSelector } from '../../store/map.selectors';
import './layer-tree.scss';


interface MapLayerTreeProps {
  /** ID формы карты. */
  id: FormID;
}


/** Дерево слоёв карты. */
export const MapLayerTree = ({id}: MapLayerTreeProps) => {
  const mapState: MapState = useSelector(mapStateSelector.bind(id));
  const stage = mapState?.stage;
  const layers = stage?.getMapData()?.layers;

  const [signal, setSignal] = useState(false);
  if (stage) stage.listeners.layerTreeChange = () => setSignal(!signal);

  const treeItems = useMemo(() => {
    return getTreeItems(layers);
  }, [layers]);

  const itemToElement = (item: LayerTreeItem, i: number) => {
    return <LayerTreeNode key={i} item={item} stage={stage}/>;
  };
  return <div>{treeItems.map(itemToElement)}</div>;
};

function getTreeItems(layers: IMapLayer[]): LayerTreeItem[] {
  const tree: LayerTreeItem[] = [];
  if (!layers) return tree;

  for (const layer of layers) {
    if (!layer.group || layer.group.length === 0) {
      tree.push(getGroupForTree(layer));
    } else {
      let parent = null;
      layer.group.split('\\').forEach((part) => {
        const trimPart = part.trim();
        const parentArray = parent?.items ?? tree;
        let index = parent?.items ? parent.index + '_' + parentArray.length : parentArray.length + '';
        parent = parentArray.find(p => p?.id === trimPart);
        if (!parent) {
          parent = {index, id: trimPart, text: trimPart, expanded: true, items: []};
          parentArray.push(parent);
        }
      });
      parent.items.push(getGroupForTree(layer));
    }
  }
  return tree;
}

function getGroupForTree(layer: IMapLayer): LayerTreeItem {
  return {id: layer.id, text: layer.displayName, sublayer: layer, visible: layer.visible};
}
