import { TFunction } from 'react-i18next';
import { NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BigButton, BigButtonToggle } from 'shared/ui';
import { NumericTextBox } from '@progress/kendo-react-inputs';
import { setMultiMapSync } from '../../store/map.actions';
import { getFullViewport } from '../../lib/map-utils';
import { coordinateFormat } from '../../lib/constants.ts';

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
  canvas: MapCanvas;
  stage: IMapStage;
  disabled: boolean;
  t: TFunction;
}


export const MapNavigation = ({id, mapState, sync, parentID, t}: MapNavigationProps) => {
  const { stage, canvas } = mapState;
  const notLoaded = mapState.loading.percentage < 100;

  return (
    <section className={'map-dimensions'}>
      <div className={'menu-header'}>{t('map.dimensions.header')}</div>
      <div className={'map-panel-main'}>
        <Dimensions canvas={canvas} stage={stage} disabled={notLoaded} t={t}/>
        <NavigationPanel id={id} parentID={parentID} state={mapState} sync={sync} t={t}/>
      </div>
    </section>
  );
};

const NavigationPanel = ({id, state, parentID, sync, t}: NavigationPanelProps) => {
  const dispatch = useDispatch();
  const { stage, canvas } = state;
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
        action={toFullViewPort} disabled={canvas?.blocked || notLoaded}
      />
      <BigButtonToggle
        text={'Синхронизация карт по центру'} icon={synchronizeIcon}
        action={toggleSync} active={sync} disabled={sync === undefined}
      />
    </div>
  );
};

const Dimensions = ({canvas, stage, disabled, t}: DimensionProps) => {
  const mapData = stage.getMapData();
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [scale, setScale] = useState(null);

  useEffect(() => {
    if (mapData) mapData.onDrawEnd = ({x, y}, scale) => {
      setX(x); setY(y); setScale(scale);
    };
  }, [mapData, stage, canvas]);

  const xChanged = (event: NumericTextBoxChangeEvent) => {
    const newX = event.value === null ? 0 : Math.round(event.value);
    stage.render({centerX: newX, centerY: mapData.y, scale: mapData.scale});
    setX(newX);
  };

  const yChanged = (event: NumericTextBoxChangeEvent) => {
    const newY = event.value === null ? 0 : Math.round(-event.value);
    stage.render({centerX: mapData.x, centerY: newY, scale: mapData.scale});
    setY(newY);
  };

  const scaleChanged = (event: NumericTextBoxChangeEvent) => {
    const newScale = event.value >= 1 ? event.value : 1;
    stage.render({centerX: mapData.x, centerY: mapData.y, scale: newScale});
    setScale(newScale);
  };

  return (
    <div className={'map-dimensions-viewer'}>
      <div>
        <span title={t('map.dimensions.x')}><img src={xIcon} alt={'x'}/> x:</span>
        <NumericTextBox
          value={x} onChange={xChanged} disabled={disabled}
          format={coordinateFormat}
        />
      </div>
      <div>
        <span title={t('map.dimensions.y')}><img src={yIcon} alt={'y'}/> y:</span>
        <NumericTextBox
          value={-y} onChange={yChanged} disabled={disabled}
          format={coordinateFormat}
        />
      </div>
      <div>
        <span title={t('map.dimensions.scale')}><img src={scaleIcon} alt={'scale'}/> 1/</span>
        <NumericTextBox
          disabled={disabled}
          value={scale < 1 ? 1 : scale} min={1} onChange={scaleChanged}
          format={'#'} defaultValue={1}
        />
      </div>
    </div>
  );
};
