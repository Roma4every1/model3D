import type { TFunction } from 'react-i18next';
import type { MapState } from '../../lib/types';
import { useState, useEffect } from 'react';
import { InputNumber } from 'antd';
import { useRender } from 'shared/react';
import { BigButton, BigButtonToggle } from 'shared/ui';
import { inputIntParser } from 'shared/locales';
import { useMultiMapSync, setMultiMapSync } from 'features/multi-map';
import { getFullViewport } from '../../lib/map-utils';

import xIcon from 'assets/map/x.png';
import yIcon from 'assets/map/y.png';
import scaleIcon from 'assets/map/scale.png';
import selectAllIcon from 'assets/map/select-all.png';
import synchronizeIcon from 'assets/map/synchronize.png';


interface MapNavigationSectionProps {
  state: MapState;
  parentID: ClientID;
  t: TFunction;
}
interface NavigationPanelProps {
  parentID: ClientID;
  state: MapState;
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


export const MapNavigationSection = ({state, parentID, t}: MapNavigationSectionProps) => {
  const render = useRender();
  const stage = state.stage;

  useEffect(() => {
    stage.subscribe('mode', render);
    return () => stage.unsubscribe('mode', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={'map-dimensions'}>
      <div className={'menu-header'}>{t('map.dimensions.header')}</div>
      <div className={'map-panel-main'}>
        <MapViewportControls state={state} t={t}/>
        <MapNavigationActions parentID={parentID} state={state} t={t}/>
      </div>
    </section>
  );
};

const MapNavigationActions = ({state, parentID, t}: NavigationPanelProps) => {
  const sync = useMultiMapSync(parentID);
  const stage = state.stage;
  const disabled = state.status !== 'ok' || stage.getModeProvider().blocked;

  const toFullViewPort = () => {
    const canvas = stage.getCanvas();
    const layers = stage.getMapData()?.layers;
    if (canvas && layers) canvas.events.emit('sync', getFullViewport(canvas, layers));
  };
  const toggleSync = () => {
    setMultiMapSync(parentID, !sync);
  };

  return (
    <div className={'big-buttons'}>
      <BigButton
        text={t('map.actions.show-all')} icon={selectAllIcon}
        onClick={toFullViewPort} disabled={disabled}
      />
      <BigButtonToggle
        text={'Синхронизация карт по центру'} icon={synchronizeIcon}
        onClick={toggleSync} active={sync} disabled={disabled || sync === undefined}
      />
    </div>
  );
};

const MapViewportControls = ({state, t}: DimensionProps) => {
  const stage = state.stage;
  const mapData = stage.getMapData();
  const disabled = stage.getModeProvider().blocked || !mapData || state.status !== 'ok';

  const [cx, setX] = useState(mapData?.x);
  const [cy, setY] = useState(mapData?.y);
  const [scale, setScale] = useState(mapData?.scale);

  useEffect(() => {
    if (mapData) mapData.onDrawEnd = ({x, y}, scale) => {
      setX(x); setY(y); setScale(scale);
    };
  }, [mapData]);

  const xChanged = (value: number) => {
    stage.render({cx: value, cy: mapData.y, scale: mapData.scale});
    setX(value);
  };
  const yChanged = (value: number) => {
    stage.render({cx: mapData.x, cy: -value, scale: mapData.scale});
    setY(-value);
  };
  const scaleChanged = (value: number) => {
    stage.render({cx: mapData.x, cy: mapData.y, scale: value});
    setScale(value);
  };

  return (
    <div>
      <InputNumber
        addonBefore={<InputPrefix icon={xIcon} prefix={'x:'} title={t('map.dimensions.x')}/>}
        value={cx} onChange={xChanged} disabled={disabled} changeOnWheel={true}
        parser={inputIntParser} precision={0}
      />
      <InputNumber
        addonBefore={<InputPrefix icon={yIcon} prefix={'y:'} title={t('map.dimensions.y')}/>}
        value={cy !== null ? -cy : null} onChange={yChanged} disabled={disabled} changeOnWheel={true}
        parser={inputIntParser} precision={0}
      />
      <InputNumber
        addonBefore={<InputPrefix icon={scaleIcon} prefix={'1/'} title={t('map.dimensions.scale')}/>}
        value={scale} onChange={scaleChanged} disabled={disabled} changeOnWheel={true}
        parser={inputIntParser} precision={0} min={1}
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
