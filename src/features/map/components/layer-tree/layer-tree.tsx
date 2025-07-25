import { type ReactElement, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRender } from 'shared/react';
import { useMapState } from '../../store/map.store';
import { Collapse } from 'antd';
import { LayerTreeLeaf } from './layer-tree-leaf';
import './layer-tree.scss';


interface LayerTreeItem {
  key: number | string;
  layer?: IMapLayer;
  pathItem?: string;
  children?: LayerTreeItem[];
}

/** Дерево слоёв карты. */
export const MapLayerTree = ({id}: {id: FormID}) => {
  const render = useRender();
  const { t } = useTranslation();
  const state = useMapState(id);
  const stage = state.stage;

  useEffect(() => {
    stage.subscribe('active-layer', render);
    return () => stage.unsubscribe('active-layer', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const layers = stage.getMapData()?.layers;
  const extraLayers = stage.getExtraLayers(true);

  const rootNodes = useMemo(() => {
    if (!layers || layers.length === 0) return [];
    return createLayerTree(layers);
  }, [layers]);

  const toElement = (item: LayerTreeItem): ReactElement => {
    const { key, layer } = item;
    if (layer) return <LayerTreeLeaf key={key} state={state} stage={stage} layer={layer} t={t}/>;
    const children = item.children.map(toElement);
    return <Collapse key={key} items={[{key, label: item.pathItem, children}]}/>;
  };

  let extraElement: ReactElement;
  if (extraLayers && extraLayers.length > 0) {
    const children = extraLayers.map((layer: IMapLayer) => {
      return <LayerTreeLeaf key={layer.id} state={state} stage={stage} layer={layer} t={t}/>;
    });
    extraElement = <Collapse items={[{key: 0, label: t('map.layer-tree.extra-group'), children}]}/>;
  }
  return (
    <div className={'map-layer-tree'}>
      {rootNodes.map(toElement)}
      {extraElement}
    </div>
  );
};

function createLayerTree(layers: IMapLayer[]): LayerTreeItem[] {
  let key = 0;
  const rootNode: LayerTreeItem = {key, children: []};

  for (const layer of layers) {
    let node = rootNode;
    for (const pathItem of layer.treePath) {
      let nodeItem = node.children.find(i => i.pathItem === pathItem);
      if (nodeItem) { node = nodeItem; continue; }

      nodeItem = {key: ++key, pathItem, children: []};
      node.children.push(nodeItem);
      node = nodeItem;
    }
    node.children.push({key: layer.id, layer});
  }
  return rootNode.children;
}
