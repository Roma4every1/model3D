import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LayersTreeElement } from './layers-tree-element';
import { mapStateSelector } from '../../store/map.selectors';
import './layers-tree.scss';


const getGroupForTree = (sublayer: MapLayer): LayerTreeItem => {
  const visible = typeof sublayer.visible === 'string' ? (sublayer.visible !== '0') : sublayer.visible;
  return {id: sublayer.uid, text: sublayer.name, sublayer, visible};
};
const getTreeItems = (sublayers: MapLayer[]): LayerTreeItem[] => {
  const tree: LayerTreeItem[] = [];
  if (sublayers) {
    sublayers.forEach(sublayer => {
      if (!sublayer.group || sublayer.group.length === 0) {
        tree.push(getGroupForTree(sublayer));
      } else {
        let parent = null;
        sublayer.group.split('\\').forEach(part => {
          const trimPart = part.trim();
          const parentArray = parent?.items ?? tree;
          let index = parent?.items ? parent.index + '_' + parentArray.length : parentArray.length + '';
          parent = parentArray.find(p => p?.id === trimPart);
          if (!parent) {
            parent = {index, id: trimPart, text: trimPart, expanded: true, items: []};
            parentArray.push(parent);
          }
        });
        parent.items.push(getGroupForTree(sublayer));
      }
    });
  }
  return tree;
}

export const MapLayerTree = ({formID}: PropsFormID) => {
  const mapState: MapState = useSelector(mapStateSelector.bind(formID));
  const layers = mapState?.mapData?.layers;

  const treeItems = useMemo(() => {
    return getTreeItems(layers);
  }, [layers]);

  const itemToElement = (item: LayerTreeItem, i: number) => {
    return <LayersTreeElement key={i} item={item} mapState={mapState} formID={formID}/>;
  };

  return <div className={'wrapper'}>{treeItems.map(itemToElement)}</div>;
};
