import { NumericTextBoxChangeEvent } from "@progress/kendo-react-inputs";
import { TFunction } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { MapPanelHeader } from "./map-panel-header";
import IntegerTextEditor from "../../../editors/IntegerTextEditor";

import { mapIconsDict } from "../../../dicts/images";
import { getPointToMap, listenerOptions } from "../map-utils";


interface DimensionsProps {
  canvas: MapCanvas,
  mapData: MapData,
  utils: MapUtils,
  t: TFunction,
}

export const Dimensions = ({canvas, mapData, utils, t}: DimensionsProps) => {
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [scale, setScale] = useState(null);

  const updateCS = useCallback(() => {
    setX(mapData.x); setY(mapData.y); setScale(mapData.scale);
    utils.pointToMap = getPointToMap(canvas, mapData.x, mapData.y, mapData.scale);
  }, [canvas, mapData, utils]);

  useEffect(() => {
    if (canvas) {
      canvas.addEventListener('mousemove', updateCS, listenerOptions);
      canvas.addEventListener('wheel', updateCS, listenerOptions);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', updateCS);
        canvas.removeEventListener('wheel', updateCS);
      }
    };
  }, [updateCS, canvas]);

  const updateCanvas = useCallback((x, y, scale) => {
    if (utils) utils.updateCanvas({centerX: x, centerY: y, scale});
  }, [utils]);

  const xChanged = (event: NumericTextBoxChangeEvent) => {
    setX(event.value);
    updateCanvas(event.value, mapData.y, mapData.scale);
  };
  const yChanged = (event: NumericTextBoxChangeEvent) => {
    setY(event.value);
    updateCanvas(mapData.x, event.value, mapData.scale);
  };
  const scaleChanged = (event: NumericTextBoxChangeEvent) => {
    setScale(event.value);
    updateCanvas(mapData.x, mapData.y, event.value);
  };

  return (
    <section className={'map-dimensions'}>
      <MapPanelHeader text={t('map.dimensions.header')}/>
      <div className={'map-panel-main'}>
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
    </section>
  );
}
