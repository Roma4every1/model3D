import { TFunction } from 'react-i18next';
import { NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { NumberFormatOptions } from '@progress/kendo-react-intl';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BigButton, BigButtonToggle } from 'shared/ui';
import { NumericTextBox } from '@progress/kendo-react-inputs';
import { setOnDrawEnd, setMultiMapSync } from '../../store/map.actions';
import { getFullViewport, getPointToMap } from '../../lib/map-utils';

import xIcon from 'assets/images/map/x.png';
import yIcon from 'assets/images/map/y.png';
import scaleIcon from 'assets/images/map/scale.png';
import selectAllIcon from 'assets/images/map/select-all.png';
import synchronizeIcon from 'assets/images/map/synchronize.png';


interface DimensionsProps {
  mapState: MapState,
  sync: boolean | undefined,
  formID: FormID,
  parentID: FormID,
  t: TFunction,
}


const coordsFormat: NumberFormatOptions = {
  style: 'decimal',
  useGrouping: false,
  maximumFractionDigits: 2,
};

export const Dimensions = ({mapState, sync, formID, parentID, t}: DimensionsProps) => {
  const dispatch = useDispatch();
  const { mapData, utils, canvas, isLoadSuccessfully } = mapState;
  const layers = mapData?.layers;

  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [scale, setScale] = useState(null);

  const onDrawEnd = useCallback((canvas, x, y, scale) => {
    setX(x); setY(y); setScale(scale);
    utils.pointToMap = getPointToMap(canvas, x, y, scale);
  }, [utils]);

  useEffect(() => {
    if (mapData) dispatch(setOnDrawEnd(formID, onDrawEnd));
  }, [mapData, onDrawEnd, dispatch, formID]);

  /** Центрировать карту. */
  const toFullViewPort = () => {
    if (!canvas || !layers) return;
    canvas.events.emit('sync', getFullViewport(layers, canvas));
  };

  /** Включить или отключить синхронизацию систем координат карт. */
  const toggleSync = () => {
    dispatch(setMultiMapSync(parentID, !sync));
    canvas.events.emit('sync', {centerX: mapData.x, centerY: mapData.y, scale: mapData.scale});
  };

  const xChanged = (event: NumericTextBoxChangeEvent) => {
    const newX = event.value === null ? 0 : Math.round(event.value);
    utils?.updateCanvas({centerX: newX, centerY: mapData.y, scale: mapData.scale});
    setX(newX);
  };

  const yChanged = (event: NumericTextBoxChangeEvent) => {
    const newY = event.value === null ? 0 : Math.round(-event.value);
    utils?.updateCanvas({centerX: mapData.x, centerY: newY, scale: mapData.scale});
    setY(newY);
  };

  const scaleChanged = (event: NumericTextBoxChangeEvent) => {
    const newScale = event.value >= 1 ? event.value : 1;
    utils?.updateCanvas({centerX: mapData.x, centerY: mapData.y, scale: newScale});
    setScale(newScale);
  };

  return (
    <section className={'map-dimensions'}>
      <div className={'menu-header'}>{t('map.dimensions.header')}</div>
      <div className={'map-panel-main'}>
        <div className={'map-dimensions-viewer'}>
          <div>
            <span title={t('map.dimensions.x')}><img src={xIcon} alt={'x'}/> x:</span>
            <NumericTextBox
              disabled={!isLoadSuccessfully}
              value={Math.round(x)}
              onChange={xChanged}
              format={coordsFormat}
            />
          </div>
          <div>
            <span title={t('map.dimensions.y')}><img src={yIcon} alt={'y'}/> y:</span>
            <NumericTextBox
              disabled={!isLoadSuccessfully}
              value={Math.round(-y)}
              onChange={yChanged}
              format={coordsFormat}
            />
          </div>
          <div>
            <span title={t('map.dimensions.scale')}><img src={scaleIcon} alt={'scale'}/> 1/</span>
            <NumericTextBox
              disabled={!isLoadSuccessfully}
              defaultValue={1}
              value={scale < 1 ? 1 : scale}
              min={1}
              onChange={scaleChanged}
              format={'#'}
            />
          </div>
        </div>
        <div className={'map-actions'}>
          <BigButton
            text={t('map.actions.show-all')} icon={selectAllIcon}
            action={toFullViewPort} disabled={canvas?.blocked === true || !mapState?.isLoadSuccessfully }
          />
          <BigButtonToggle
            text={'Синхронизация карт по центру'} icon={synchronizeIcon}
            action={toggleSync} active={sync} disabled={sync === undefined}
          />
        </div>
      </div>
    </section>
  );
};
