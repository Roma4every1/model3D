import { TFunction } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BigButton, BigButtonToggle } from 'shared/ui';
import { InputNumber } from 'antd';
import { inputNumberParser } from 'shared/locales';
import { setMultiMapSync } from '../../store/map.actions';
import { getFullViewport } from '../../lib/map-utils';

import xIcon from 'assets/images/map/x.png';
import yIcon from 'assets/images/map/y.png';
import scaleIcon from 'assets/images/map/scale.png';
import selectAllIcon from 'assets/images/map/select-all.png';
import synchronizeIcon from 'assets/images/map/synchronize.png';


interface MapNavigationProps {
  id: FormID;
  mapState: MapState;
  sync: boolean | undefined;
  parentID: ClientID;
  t: TFunction;
}
interface NavigationPanelProps {
  id: FormID;
  parentID: ClientID;
  state: MapState;
  sync: boolean;
  t: TFunction;
}
interface DimensionProps {
  state: MapState;
  t: TFunction;
}
interface InputPrefixProps {
  icon: string;
  prefix: string;
  title: string;
}


export const MapNavigation = ({id, mapState, sync, parentID, t}: MapNavigationProps) => {
  return (
    <section className={'map-dimensions'}>
      <div className={'menu-header'}>{t('map.dimensions.header')}</div>
      <div className={'map-panel-main'}>
        <Dimensions state={mapState} t={t}/>
        <NavigationPanel id={id} parentID={parentID} state={mapState} sync={sync} t={t}/>
      </div>
    </section>
  );
};

const NavigationPanel = ({id, state, parentID, sync, t}: NavigationPanelProps) => {
  const dispatch = useDispatch();
  const { stage, canvas } = state;
  const disabled = stage.inclinometryModeOn;
  const notLoaded = state.loading.percentage < 100;

  const [signal, setSignal] = useState(false);
  stage.listeners.navigationPanelChange = () => setSignal(!signal);

  const mapData = stage.getMapData();
  const layers = mapData?.layers;

  /** Центрировать карту. */
  const toFullViewPort = () => {
    if (!canvas || !layers) return;
    canvas.events.emit('sync', getFullViewport(layers, canvas));
  };

  /** Включить или отключить синхронизацию систем координат карт. */
  const toggleSync = () => {
    dispatch(setMultiMapSync(id, parentID, !sync));
  };

  return (
    <div className={'map-actions'}>
      <BigButton
        text={t('map.actions.show-all')} icon={selectAllIcon}
        action={toFullViewPort} disabled={canvas?.blocked || disabled || notLoaded}
      />
      <BigButtonToggle
        text={'Синхронизация карт по центру'} icon={synchronizeIcon}
        action={toggleSync} active={sync} disabled={disabled || sync === undefined}
      />
    </div>
  );
};

const Dimensions = ({state, t}: DimensionProps) => {
  const { stage, canvas } = state;
  const mapData = stage.getMapData();
  const disabled = stage.inclinometryModeOn || !mapData || state.loading.percentage < 100;

  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [scale, setScale] = useState(null);

  useEffect(() => {
    if (mapData) mapData.onDrawEnd = ({x, y}, scale) => {
      setX(x); setY(y); setScale(scale);
    };
  }, [mapData, canvas]);

  const xChanged = (value: number) => {
    stage.render({centerX: value, centerY: mapData.y, scale: mapData.scale});
    setX(value);
  };
  const yChanged = (value: number) => {
    stage.render({centerX: mapData.x, centerY: -value, scale: mapData.scale});
    setY(-value);
  };
  const scaleChanged = (value: number) => {
    stage.render({centerX: mapData.x, centerY: mapData.y, scale: value});
    setScale(value);
  };

  return (
    <div>
      <InputNumber
        addonBefore={<InputPrefix icon={xIcon} prefix={'x:'} title={t('map.dimensions.x')}/>}
        value={x} onChange={xChanged} disabled={disabled} changeOnWheel={true}
        parser={inputNumberParser} precision={0}
      />
      <InputNumber
        addonBefore={<InputPrefix icon={yIcon} prefix={'y:'} title={t('map.dimensions.y')}/>}
        value={y !== null ? -y : null} onChange={yChanged} disabled={disabled} changeOnWheel={true}
        parser={inputNumberParser} precision={0}
      />
      <InputNumber
        addonBefore={<InputPrefix icon={scaleIcon} prefix={'1/'} title={t('map.dimensions.scale')}/>}
        value={scale} onChange={scaleChanged} disabled={disabled} changeOnWheel={true}
        parser={inputNumberParser} precision={0} min={1}
      />
    </div>
  );
};

const InputPrefix = ({icon, prefix, title}: InputPrefixProps) => {
  return (
    <div className={'input-prefix'} title={title}>
      <img src={icon} alt={prefix}/>
      <span>{prefix}</span>
    </div>
  );
};
