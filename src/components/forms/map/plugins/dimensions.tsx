import { NumericTextBoxChangeEvent } from "@progress/kendo-react-inputs";
import { TFunction } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import IntegerTextEditor from "../../../editors/integer-text.editor";

import { actions } from "../../../../store";
import { mapIconsDict } from "../../../../dicts/images";
import { getParentFormId } from "../../../../utils/utils";
import { getFullViewport, getPointToMap } from "../map-utils";


interface DimensionsProps {
  mapState: MapState,
  sync: boolean | undefined,
  formID: FormID,
  t: TFunction,
}


export const Dimensions = ({mapState, sync, formID, t}: DimensionsProps) => {
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
    if (mapData) dispatch(actions.setOnDrawEnd(formID, onDrawEnd));
  }, [mapData, onDrawEnd, dispatch, formID]);

  /** Центрировать карту. */
  const toFullViewPort = useCallback(() => {
    if (!canvas || !layers) return;
    canvas.events.emit('sync', getFullViewport(layers, canvas));
  }, [canvas, layers]);

  /** Включить или отключить синхронизацию систем координат карт. */
  const toggleSync = useCallback(() => {
    dispatch(actions.setMultiMapSync(getParentFormId(formID), !sync));
    canvas.events.emit('sync', {centerX: mapData.x, centerY: mapData.y, scale: mapData.scale});
  }, [sync, canvas, mapData, dispatch, formID]);

  const updateCanvas = useCallback((x, y, scale) => {
    if (utils) utils.updateCanvas({centerX: x, centerY: y, scale});
  }, [utils]);

  const xChanged = useCallback((event: NumericTextBoxChangeEvent) => {
    updateCanvas(event.value, mapData.y, mapData.scale);
    setX(event.value);
  }, [updateCanvas, mapData]);

  const yChanged = useCallback((event: NumericTextBoxChangeEvent) => {
    updateCanvas(mapData.x, event.value, mapData.scale);
    setY(event.value);
  }, [updateCanvas, mapData]);

  const scaleChanged = useCallback((event: NumericTextBoxChangeEvent) => {
    updateCanvas(mapData.x, mapData.y, event.value);
    setScale(event.value);
  }, [updateCanvas, mapData]);

  return (
    <section className={'map-dimensions'}>
      <div className={'menu-header'}>{t('map.dimensions.header')}</div>
      <div className={'map-panel-main'}>
        <div className={'map-dimensions-viewer'}>
          <div>
            <span title={t('map.dimensions.x')}><img src={mapIconsDict['x']} alt={'x'}/> x:</span>
            <IntegerTextEditor id={'xDimensionEditor'} value={x} selectionChanged={xChanged} />
          </div>
          <div>
            <span title={t('map.dimensions.y')}><img src={mapIconsDict['y']} alt={'y'}/> y:</span>
            <IntegerTextEditor id={'yDimensionEditor'} value={y} selectionChanged={yChanged} />
          </div>
          <div>
            <span title={t('map.dimensions.scale')}><img src={mapIconsDict['scale']} alt={'scale'}/> 1/</span>
            <IntegerTextEditor id={'scaleDimensionEditor'} value={scale} selectionChanged={scaleChanged} />
          </div>
        </div>
        <div className={'map-actions'}>
          <button className={'map-action'} onClick={toFullViewPort} disabled={canvas?.blocked === true}>
            <div><img src={mapIconsDict['select-all']} alt={'select-all'}/></div>
            <div>{t('map.actions.show-all')}</div>
          </button>
          <button className={'map-action' + (sync ? ' selected' : '')} onClick={toggleSync} disabled={sync === undefined}>
            <div><img src={mapIconsDict['synchronize']} alt={'synchronize'}/></div>
            <div>{'Синхронизация карт по центру'}</div>
          </button>
        </div>
      </div>
    </section>
  );
}
