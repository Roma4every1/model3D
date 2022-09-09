import { NumericTextBoxChangeEvent } from "@progress/kendo-react-inputs";
import { TFunction } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { MapPanelHeader } from "./map-panel-header";
import IntegerTextEditor from "../../../editors/IntegerTextEditor";

import { actions } from "../../../../store";
import { mapIconsDict } from "../../../dicts/images";
import { getPointToMap } from "../map-utils";


interface DimensionsProps {
  mapState: MapState,
  formID: FormID,
  t: TFunction,
}

export const Dimensions = ({mapState, formID, t}: DimensionsProps) => {
  const dispatch = useDispatch();
  const { mapData, utils } = mapState

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
    dispatch(actions.setOnDrawEnd(formID, onDrawEnd));
  }, [onDrawEnd, dispatch, formID]);

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
