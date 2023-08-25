import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LayersTreeElement } from './layers-tree-element';
import { mapStateSelector } from '../../store/map.selectors';
import './layers-tree.scss';


interface MapLayerTreeProps {
  /** ID формы карты. */
  id: FormID;
}


/** Дерево слоёв карты. */
export const MapLayerTree = ({id}: MapLayerTreeProps) => {
  const mapState: MapState = useSelector(mapStateSelector.bind(id));
  const layers = mapState?.mapData?.layers;

  const treeItems = useMemo(() => {
    return getTreeItems(layers);
  }, [layers]);

  const itemToElement = (item: LayerTreeItem, i: number) => {
    return <LayersTreeElement key={i} item={item} mapState={mapState} formID={id}/>;
  };

  return <div>{treeItems.map(itemToElement)}</div>;
};

function getTreeItems(layers: MapLayer[]): LayerTreeItem[] {
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

function getGroupForTree(layer: MapLayer): LayerTreeItem {
  const visible = typeof layer.visible === 'string' ? (layer.visible !== '0') : layer.visible;
  return {id: layer.uid, text: layer.name, sublayer: layer, visible};
}
