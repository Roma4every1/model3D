import { TFunction } from 'react-i18next';
import { NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BigButton, BigButtonToggle } from 'shared/ui';
import { NumericTextBox } from '@progress/kendo-react-inputs';
import { setOnDrawEnd, setMultiMapSync } from '../../store/maps.actions';
import { getFullViewport, getPointToMap } from '../../lib/map-utils';

import xIcon from 'assets/images/map/x.png';
import yIcon from 'assets/images/map/y.png';
import scaleIcon from 'assets/images/map/scale.png';
import selectAllIcon from 'assets/images/map/select-all.png';
import synchronizeIcon from 'assets/images/map/synchronize.png';
import {NumberFormatOptions} from "@progress/kendo-react-intl";

interface DimensionsProps {
  mapState: MapState,
  sync: boolean | undefined,
  formID: FormID,
  parentID: FormID,
  t: TFunction,
}

const coordsFormat : NumberFormatOptions = {style: 'decimal', useGrouping: false, maximumFractionDigits: 2};

export const Dimensions = ({mapState, sync, formID, parentID, t}: DimensionsProps) => {
  const dispatch = useDispatch();
  const { mapData, utils, canvas } = mapState;
  const layers = mapData?.layers;

  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [scale, setScale] = useState(null);

  const setDimensions = useCallback((x: number, y: number, scale: number) => {
    setX(x); setY(y); setScale(scale);
  }, [setX, setY, setScale]);

  const onDrawEnd = useCallback((canvas, x, y, scale) => {
    setDimensions(x, y, scale);
    utils.pointToMap = getPointToMap(canvas, x, y, scale);
  }, [setDimensions, utils]);

  useEffect(() => {
    if(mapState?.isLoadSuccessfully)
      updateCanvas(x, y, scale);
  }, [mapState?.isLoadSuccessfully, x, y, scale])

  useEffect(() => {
    if (mapData) dispatch(setOnDrawEnd(formID, onDrawEnd));
  }, [mapData, onDrawEnd, dispatch, formID]);

  /** Центрировать карту. */
  const toFullViewPort = useCallback(() => {
    if (!canvas || !layers) return;
    canvas.events.emit('sync', getFullViewport(layers, canvas));
  }, [canvas, layers]);

  /** Включить или отключить синхронизацию систем координат карт. */
  const toggleSync = useCallback(() => {
    dispatch(setMultiMapSync(parentID, !sync));
    canvas.events.emit('sync', {centerX: mapData.x, centerY: mapData.y, scale: mapData.scale});
  }, [sync, canvas, mapData, parentID, dispatch]);

  const updateCanvas = useCallback((x, y, scale) => {
    if (utils) utils.updateCanvas({centerX: x, centerY: y, scale});
  }, [utils]);

  const xChanged = useCallback((event: NumericTextBoxChangeEvent) => {
    if (event.value === null) return;
    const newX = Math.round(+event.value);
    updateCanvas(newX, mapData.y, mapData.scale);
    setX(newX);
  }, [updateCanvas, mapData]);

  const yChanged = useCallback((event: NumericTextBoxChangeEvent) => {
    if (event.value === null) return;
    const newY = Math.round(+event.value);
    updateCanvas(mapData.x, newY, mapData.scale);
    setY(newY);
  }, [updateCanvas, mapData]);

  const scaleChanged = useCallback((event: NumericTextBoxChangeEvent) => {
    const newScale = event.value >= 1 ? event.value : 1;
    updateCanvas(mapData.x, mapData.y, newScale);
    setScale(newScale);
  }, [updateCanvas, mapData]);

  return (
    <section className={'map-dimensions'}>
      <div className={'menu-header'}>{t('map.dimensions.header')}</div>
      <div className={'map-panel-main'}>
        <div className={'map-dimensions-viewer'}>
          <div>
            <span title={t('map.dimensions.x')}><img src={xIcon} alt={'x'}/> x:</span>
            <NumericTextBox value={Math.round(x)} onChange={xChanged} format={coordsFormat}/>
          </div>
          <div>
            <span title={t('map.dimensions.y')}><img src={yIcon} alt={'y'}/> y:</span>
            <NumericTextBox value={Math.round(y)} onChange={yChanged} format={coordsFormat}/>
          </div>
          <div>
            <span title={t('map.dimensions.scale')}><img src={scaleIcon} alt={'scale'}/> 1/</span>
            <NumericTextBox defaultValue={1} value={scale < 1 ? 1 : scale} min={1} onChange={scaleChanged} format={'#'}/>
          </div>
        </div>
        <div className={'map-actions'}>
          <BigButton
            text={t('map.actions.show-all')} icon={selectAllIcon}
            action={toFullViewPort} disabled={canvas?.blocked === true}
          />
          <BigButtonToggle
            text={'Синхронизация карт по центру'} icon={synchronizeIcon}
            action={toggleSync} active={sync} disabled={sync === undefined}
          />
        </div>
      </div>
    </section>
  );
}
