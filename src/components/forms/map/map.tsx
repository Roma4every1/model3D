import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Scroller } from "./drawer/scroller";
import { MapNotFound, MapLoadError, CircularProgressBar } from "../multi-map/multi-map-item";
import { createMapsDrawer } from "./drawer";
import { getParentFormId, tableRowToString } from "../../../utils/utils";
import { getFullViewport, getMultiMapChildrenCanvases } from "./map-utils";
import { fetchMapData } from "../../../store/thunks";
import { actions, selectors } from "../../../store";


export const Map = ({formID, channels, data}: FormProps & {data?: MapData}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const parentForm = getParentFormId(formID);

  const currentWellID = useSelector(selectors.currentWellID);
  const mapsState = useSelector(selectors.mapsState);
  const mapState: MapState = useSelector(selectors.mapState.bind(formID));

  const canvasRef = useRef(null);
  const mapDrawnData = useRef(null);
  const scroller = useRef(null);

  const [isMapExist, setIsMapExist] = useState(true);
  const [progress, setProgress] = useState(0);

  const canvas = mapState?.canvas;
  const mapData = mapState?.mapData;
  const selectedElement = mapState?.element;
  const utils = mapState?.utils;

  const isPartOfDynamicMultiMap = data !== undefined;
  const activeChannelName = isPartOfDynamicMultiMap ? null : channels[0];
  const activeChannel: Channel = useSelector(selectors.channel.bind(activeChannelName));

  // добавление состояния в хранилище состояний карт
  useEffect(() => {
    if (!mapState) dispatch(actions.createMapState(formID, createMapsDrawer()));
  }, [mapState, dispatch, formID]);

  // обновление списка связанных карт
  useEffect(() => {
    const canvases = getMultiMapChildrenCanvases(mapsState.multi, mapsState.single, formID);
    if (scroller.current) scroller.current.setList(canvases);
  }, [mapsState, mapState, formID]);

  useEffect(() => {
    if (!mapState || !isPartOfDynamicMultiMap) return;
    if (!mapState.mapID && data.layers) {
      dispatch(actions.setMapField(formID, 'mapID', data));
      dispatch(actions.loadMapSuccess(formID, data));
    }
  }, [isPartOfDynamicMultiMap, mapState, formID, data, dispatch]);

  // проверка параметров формы
  useEffect(() => {
    if (!mapState || isPartOfDynamicMultiMap) return;
    const rows = activeChannel?.data?.Rows;
    if (!rows || rows.length === 0) return setIsMapExist(false);

    setIsMapExist(true);

    const mapInfo = rows[0];
    const owner = mapInfo.Cells[12];
    const mapID = String(mapInfo.Cells[0]);

    const changeOwner = owner !== mapState.owner;
    const changeMapID = mapID !== mapState.mapID;

    if (changeOwner || changeMapID || activeChannel.currentRowObjectName) {
      const value = tableRowToString(activeChannel, mapInfo)?.value;
      dispatch(actions.updateParam(parentForm, activeChannel.currentRowObjectName, value));
    }
    if (changeOwner) {
      dispatch(actions.setMapField(formID, 'owner', owner));
    }
    if (changeMapID) {
      setProgress(0);
      dispatch(actions.setMapField(formID, 'mapID', mapID));
      dispatch(fetchMapData(formID, mapID, owner, setProgress));
    }
  }, [mapState, activeChannel, formID, parentForm, isPartOfDynamicMultiMap, dispatch]);

  const draw = useCallback((canvas, map, scale, x, y, selected) => {
    if (!mapState?.drawer || !canvas) return;
    if (mapDrawnData.current) mapDrawnData.current.emit('detach');
    const data = {centerx: x, centery: y, scale, selected};
    mapDrawnData.current = mapState.drawer.showMap(canvas, map, data);
  }, [mapState?.drawer]);

  const updateCanvas = useCallback((newCS, context) => {
    if (!mapData) return;
    let x,y, scale;
    if (newCS) {
      x = newCS.centerX; y = newCS.centerY;
      scale = newCS.scale;
    } else {
      x = mapData.x; y = mapData.y;
      scale = mapData.scale;
    }
    draw(context || canvasRef.current, mapData, scale, x, y, selectedElement);
  }, [draw, mapData, selectedElement]);

  // переопределение функции updateCanvas
  useEffect(() => {
    if (utils) utils.updateCanvas = updateCanvas;
  }, [utils, updateCanvas]);

  const getWellCS = useCallback((wellID, maxScale) => {
    const point = mapData?.points.find(p => p.name === wellID);
    if (point && scroller.current) {
      const scale = mapData.scale < maxScale ? mapData.scale : maxScale;
      return {centerX: point.x, centerY: point.y, scale};
    }
    return null;
  }, [mapData]);

  const wellsMaxScale = useMemo(() => {
    const layers = mapData?.layers;
    if (!layers) return 50_000;
    for (const { elements, highscale } of layers) {
      if (elements.length && elements[0].type === 'sign') return highscale;
    }
    return 50_000;
  }, [mapData?.layers]);

  // подстраивание карты под выбранную скважину
  useEffect(() => {
    const cs = getWellCS(currentWellID, wellsMaxScale);
    if (cs) updateCanvas(cs, canvasRef.current);
  }, [currentWellID, wellsMaxScale, getWellCS, updateCanvas]);

  // закрепление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current && canvasRef.current !== canvas && mapData) {
      dispatch(actions.setMapField(formID, 'canvas', canvasRef.current));

      scroller.current
        ? scroller.current.setCanvas(canvasRef.current)
        : scroller.current = new Scroller(canvasRef.current);
      if (!mapState.scroller) dispatch(actions.setMapField(formID, 'scroller', scroller.current));

      const cs = getWellCS(currentWellID, wellsMaxScale) || getFullViewport(mapData.layers, canvasRef.current);
      updateCanvas(cs, canvasRef.current);
    }
  });

  if (!mapState) return null;
  if (!isMapExist) return <MapNotFound t={t}/>;
  if (mapState.isLoadSuccessfully === undefined) return <CircularProgressBar percentage={progress} size={100}/>;
  if (mapState.isLoadSuccessfully === false) return <MapLoadError t={t}/>;

  return (
    <div className={'map-container'}>
      <canvas style={{cursor: mapState.cursor}} ref={canvasRef}/>
    </div>
  );
};
