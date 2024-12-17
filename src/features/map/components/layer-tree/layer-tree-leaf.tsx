import type { TFunction } from 'react-i18next';
import type { MapState } from '../../lib/types';
import { useState, useEffect } from 'react';
import { useRender } from 'shared/react';
import { Button, Checkbox, InputNumber } from 'antd';
import { SettingOutlined, UndoOutlined } from '@ant-design/icons';
import { inputIntParser } from 'shared/locales';
import { cancelMapEditing } from '../../store/map-edit.actions';


interface LayersTreeLayerProps {
  state?: MapState;
  stage: IMapStage;
  layer: IMapLayer;
  t: TFunction;
}

export const LayerTreeLeaf = ({state, stage, layer, t}: LayersTreeLayerProps) => {
  const render = useRender();
  const minScale = layer.getMinScale();
  const maxScale = layer.getMaxScale();

  const [expanded, setExpanded] = useState(false);
  const [initMinScale, setInitMinScale] = useState(minScale);
  const [initMaxScale, setInitMaxScale] = useState(maxScale);

  // обновление состояния при смене слоя
  useEffect(() => {
    setInitMinScale(layer.getMinScale());
    setInitMaxScale(layer.getMaxScale());
  }, [layer]);

  const onExpandChange = () => {
    setExpanded(!expanded)
  };
  const onVisibilityChange = () => {
    if (layer.visible && layer.active) {
      if (state?.edit.creating) cancelMapEditing(state.id);
      stage.setActiveLayer(null);
    }
    layer.visible = !layer.visible;
    render(); stage.render();
  };
  const onHeaderClick = layer.temporary ? undefined : () => {
    if (layer.active) {
      if (state?.edit.creating) cancelMapEditing(state.id);
      stage.setActiveLayer(null);
    } else {
      stage.setActiveLayer(layer);
      if (!layer.visible) onVisibilityChange();
    }
  };

  const onMinScaleChange = (value: number | null) => {
    if (value === null) value = 0;
    layer.setMinScale(value);
    render(); stage.render();
  };
  const onMaxScaleChange = (value: number | null) => {
    if (value === null) value = 0;
    layer.setMaxScale(value);
    render(); stage.render();
  };
  const setInfinity = () => {
    layer.setMaxScale(Infinity);
    render(); stage.render();
  };

  const apply = () => {
    setInitMinScale(minScale);
    setInitMaxScale(maxScale);
  };
  const rollback = () => {
    layer.setMinScale(initMinScale);
    layer.setMaxScale(initMaxScale);
    render(); stage.render();
  };

  return (
    <div className={'map-layer'}>
      <div
        className={'map-layer-header' + (layer.active ? ' selected' : '')}
        style={layer.temporary ? {cursor: 'default'} : undefined}
      >
        <Checkbox checked={layer.visible} onChange={onVisibilityChange}/>
        <span onClick={onHeaderClick}>{layer.displayName}</span>
        <Button
          type={'text'} style={{borderRadius: 0}} icon={<SettingOutlined/>}
          title={t('map.layer-tree.visibility-control')} onClick={onExpandChange}
        />
      </div>
      {expanded && <div className={'map-layer-settings'}>
        <fieldset>
          <div>{t('map.layer-tree.min-scale')}:</div>
          <InputNumber
            value={minScale} min={0} max={maxScale} onChange={onMinScaleChange}
            parser={inputIntParser} controls={false} style={{width: 90}}
          />
        </fieldset>
        <fieldset>
          <div>{t('map.layer-tree.max-scale')}:</div>
          <InputNumber
            value={maxScale} min={minScale} onChange={onMaxScaleChange}
            parser={inputIntParser} controls={false} style={{width: 90}}
            addonAfter={<span style={{padding: '3px 5px'}} onClick={setInfinity}>{'∞'}</span>}
          />
        </fieldset>
        <div>
          <Button onClick={apply}>{t('base.apply')}</Button>
          <Button onClick={rollback} title={t('map.layer-tree.rollback')} icon={<UndoOutlined/>}/>
        </div>
      </div>}
    </div>
  );
};
