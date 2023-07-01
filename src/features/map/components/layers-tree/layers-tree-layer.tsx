import { MouseEvent, useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { InputChangeEvent, Input, Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Popup } from '@progress/kendo-react-popup';
import { MenuSelectEvent, Menu, MenuItem } from '@progress/kendo-react-layout';
import { LayerStatisticsWindow } from './layer-stat-window';
import { setOpenedWindow } from 'entities/windows';
import { setActiveLayer } from '../../store/map.actions';


interface LayersTreeLayerProps {
  layer: MapLayer,
  mapState: MapState,
  formID: FormID,
}


export const LayersTreeLayer = ({layer, mapState, formID}: LayersTreeLayerProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const utils = mapState?.utils;
  const activeLayer = mapState?.activeLayer;

  const [checked, setChecked] = useState(layer.visible);
  const [lowScale, setLowScale] = useState(layer.lowscale.toString());
  const [highScale, setHighScale] = useState(layer.highscale.toString());

  const [initLowScale, setInitLowScale] = useState(layer.lowscale);
  const [initHighScale, setInitHighScale] = useState(layer.highscale);

  const [selected, setSelected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [offset, setOffset] = useState({ left: 0, top: 0 });

  const menuWrapperRef = useRef(null);

  // обновление активного слоя
  useEffect(() => {
    setSelected(layer === activeLayer);
  }, [activeLayer, layer]);

  // обновление состояния при смене слоя
  useEffect(() => {
    setChecked(layer.visible);
    setHighScale(layer.highscale.toString());
    setLowScale(layer.lowscale.toString());

    setInitLowScale(layer.lowscale);
    setInitHighScale(layer.highscale);
  }, [layer]);

  const onLowScaleChange = (e: InputChangeEvent) => {
    setLowScale(e.value);
  };

  const onHighScaleChange = (e: InputChangeEvent) => {
    setHighScale(e.value);
  };

  const setExpandedState = () => {
    setExpanded(!expanded)
  };
  const setInfinity = () => {
    setHighScale(t('base.infinitySign'))
  };
  const onPopupOpen = () => {
    menuWrapperRef.current.querySelector("[tabindex]").focus()
  };

  const onChecked = () => {
    layer.visible = !checked;
    setChecked(!checked);
    if (!layer.visible && selected) {
      dispatch(setActiveLayer(formID, null));
      setSelected(false);
    }
    utils.updateCanvas();
  };

  const setSelectedState = () => {
    if (selected) {
      dispatch(setActiveLayer(formID, null));
    } else {
      dispatch(setActiveLayer(formID, layer));
      if (!checked) onChecked();
    }
    setSelected(!selected);
  };

  const applyLayerScales = () => {
    const newLowScale = parseInt(lowScale);
    const newHighScale = highScale === t('base.infinitySign') ? 'INF' : parseInt(highScale);

    if (!isNaN(newLowScale)) {
      layer.lowscale = newLowScale;
      setInitLowScale(newLowScale);
    }
    if (newHighScale === 'INF' || !isNaN(newHighScale)) {
      layer.highscale = newHighScale;
      setInitHighScale(newHighScale);
    }
    utils.updateCanvas();
  };

  const rollbackLayerScales = () => {
    layer.lowscale = initLowScale;
    layer.highscale = initHighScale;
    setLowScale(initLowScale.toString());
    setHighScale(initHighScale === 'INF' ? t('base.infinitySign') : initHighScale.toString());
    utils.updateCanvas();
  };

  const onMenuSelect = (e: MenuSelectEvent) => {
    if (e.item.text === t('base.statistics')) {
      const window = <LayerStatisticsWindow header={layer.name} key={'layerStatWindow'} layer={layer}/>;
      dispatch(setOpenedWindow('layerStatWindow', true, window));
    }
    setMenuOpen(false);
  };

  const onContextMenu = (e: MouseEvent) => {
    setOffset({ left: e.clientX, top: e.clientY });
    setMenuOpen(true);
    e.preventDefault();
  };

  return (
    <div className={'map-layer'}>
      <div className={'map-layer-header' + (selected ? ' selected' : '')} onContextMenu={onContextMenu}>
        <Checkbox value={checked} onChange={onChecked} />
        <span onClick={setSelectedState}>{layer.name}</span>
        <button className={'k-button k-button-clear'} onClick={setExpandedState} title={t('map.layerVisibilityControl')}>
          <span className={'k-icon k-i-gear'}/>
        </button>
        <Popup popupClass={'popup-content'} offset={offset} show={menuOpen} onOpen={onPopupOpen}>
          <div ref={menuWrapperRef} onBlur={() => setMenuOpen(false)}>
            <Menu vertical={true} style={{display: 'inline-block'}} onSelect={onMenuSelect}>
              <MenuItem text={t('base.statistics')} />
            </Menu>
          </div>
        </Popup>
      </div>
      {expanded &&
        <div className={'map-layer-toolbar'}>
          <div className={'map-layer-type'}>{`Тип элементов: ${t('map.' + layer.elementType)}`}</div>
          <fieldset>
            <div>{t('map.layers-tree.min-scale')}</div>
            <div>
              <Input value={lowScale} onChange={onLowScaleChange}/>
            </div>
          </fieldset>
          <fieldset>
            <div>{t('map.layers-tree.max-scale')}</div>
            <div>
              <Input value={highScale} onChange={onHighScaleChange}/>
              <Button onClick={setInfinity}>{t('base.infinitySign')}</Button>
            </div>
          </fieldset>
          <div className={'map-layer-bottom'}>
            <Button  onClick={applyLayerScales}>
              {t('base.apply')}
            </Button>
            <Button onClick={rollbackLayerScales} title={t('map.revertInitialValues')}>
              <span className={'k-icon k-i-reset-sm'}/>
            </Button>
          </div>
        </div>
      }
    </div>
  );
};
