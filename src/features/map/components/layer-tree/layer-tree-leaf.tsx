import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericTextBox, Checkbox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';


interface LayersTreeLayerProps {
  stage: IMapStage;
  layer: IMapLayer;
}


export const LayerTreeLeaf = ({stage, layer}: LayersTreeLayerProps) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [minScale, setMinScale] = useState(0);
  const [maxScale, setMaxScale] = useState(0);
  const [initMinScale, setInitMinScale] = useState(0);
  const [initMaxScale, setInitMaxScale] = useState(0);

  // обновление состояния при смене слоя
  useEffect(() => {
    setChecked(layer.visible);
    setMinScale(layer.getMinScale());
    setMaxScale(layer.getMaxScale());
    setInitMinScale(layer.getMinScale());
    setInitMaxScale(layer.getMaxScale());
  }, [layer]);

  const onClick = () => {
    if (layer.active) {
      stage.setActiveLayer(null);
    } else {
      stage.setActiveLayer(layer);
      if (!checked) onVisibilityChange();
    }
  };
  const onExpandChange = () => {
    setExpanded(!expanded)
  };
  const onVisibilityChange = () => {
    layer.visible = !checked;
    setChecked(!checked);
    if (checked && layer.active) {
      stage.setActiveLayer(null);
    }
    stage.render();
  };

  const onMinScaleChange = ({value}: NumericTextBoxChangeEvent) => {
    if (value === null) value = 0;
    setMinScale(value);
    layer.setMinScale(value);
    stage.render();
  };
  const onMaxScaleChange = ({value}: NumericTextBoxChangeEvent) => {
    if (value === null) value = 0;
    setMaxScale(value);
    layer.setMaxScale(value);
    stage.render();
  };
  const setInfinity = () => {
    setMaxScale(Infinity);
    layer.setMaxScale(Infinity);
    stage.render();
  };

  const apply = () => {
    setInitMinScale(minScale);
    setInitMaxScale(maxScale);
  };
  const rollback = () => {
    setMinScale(initMinScale);
    setMaxScale(initMaxScale);
    layer.setMinScale(initMinScale);
    layer.setMaxScale(initMaxScale);
    stage.render();
  };

  return (
    <div className={'map-layer'}>
      <div className={'map-layer-header' + (layer.active ? ' selected' : '')}>
        <Checkbox checked={checked} onChange={onVisibilityChange} />
        <span onClick={onClick}>{layer.displayName}</span>
        <button className={'k-button k-button-clear'} onClick={onExpandChange} title={t('map.layerVisibilityControl')}>
          <span className={'k-icon k-i-gear'}/>
        </button>
      </div>
      {expanded &&
        <div className={'map-layer-toolbar'}>
          <div className={'map-layer-type'}>{`Тип элементов: ${t('map.' + layer.elementType)}`}</div>
          <fieldset>
            <div>{t('map.layers-tree.min-scale')}</div>
            <div>
              <NumericTextBox
                value={minScale} onChange={onMinScaleChange}
                min={0} max={maxScale} format={'#'} spinners={false}
              />
            </div>
          </fieldset>
          <fieldset>
            <div>{t('map.layers-tree.max-scale')}</div>
            <div>
              <NumericTextBox
                value={maxScale} onChange={onMaxScaleChange}
                min={minScale} format={'#'} spinners={false}
              />
              <Button onClick={setInfinity}>{'∞'}</Button>
            </div>
          </fieldset>
          <div className={'map-layer-bottom'}>
            <Button onClick={apply}>
              {t('base.apply')}
            </Button>
            <Button onClick={rollback} title={t('map.revertInitialValues')}>
              <span className={'k-icon k-i-reset-sm'}/>
            </Button>
          </div>
        </div>
      }
    </div>
  );
};
