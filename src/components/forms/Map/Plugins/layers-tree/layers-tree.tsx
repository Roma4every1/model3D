import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { LayersTreeElement } from "./layers-tree-element";
import { selectors } from "../../../../../store";
import "../../../../../styles/layers-tree.scss";


const getGroupForTree = (sublayer: MapLayer): LayerTreeItem => {
  const visible = typeof sublayer.visible === 'string' ? (sublayer.visible !== '0') : sublayer.visible;
  return {id: sublayer.uid, text: sublayer.name, sublayer, visible};
};
const getLayersTree = (sublayers: MapLayer[]): LayerTreeItem[] => {
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

export default function MapLayersTree({formId: formID}: {formId: FormID}) {
  const formChildrenState: FormChildrenState = useSelector(selectors.formChildrenState.bind(formID));
  const activeChildID = formChildrenState?.activeChildren[0];

  const mapState: MapState = useSelector(selectors.mapState.bind(activeChildID));
  const sublayers = mapState?.mapData?.layers;

  const layersTree = useMemo(() => {
    return getLayersTree(sublayers);
  }, [sublayers]);

  const mapLayersTree = useCallback((item: LayerTreeItem, index: number) => {
    return <LayersTreeElement key={index} item={item} mapState={mapState} formID={activeChildID} />;
  }, [mapState, activeChildID]);

  return <div className={'wrapper'}>{layersTree.map(mapLayersTree)}</div>;
}
