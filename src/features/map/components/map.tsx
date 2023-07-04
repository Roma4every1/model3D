import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { channelSelector } from 'entities/channels';
import { traceStateSelector, wellStateSelector, setCurrentTrace } from 'entities/objects';
import { updateParam, currentPlastCodeSelector} from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';

import { Scroller } from '../drawer/scroller';
import { mapsStateSelector, mapStateSelector } from '../store/map.selectors';
import { fetchMapData } from '../store/map.thunks';
import { CircularProgressBar } from 'shared/ui';
import { MapNotFound, MapLoadError } from '../../multi-map/multi-map-item';
import { setMapField, loadMapSuccess, loadMapError, applyTraceToMap } from '../store/map.actions';
import { handleClick } from '../lib/traces-map-utils';

import {
  clientPoint, getFullViewport, getMultiMapChildrenCanvases, getPointToMap,
  listenerOptions,
} from '../lib/map-utils';


export const Map = ({id, parent, channels, data}: FormState & {data?: MapData}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { model: currentWell } = useSelector(wellStateSelector);
  const { model: currentTrace, editing: traceEditing } = useSelector(traceStateSelector);

  const mapsState = useSelector(mapsStateSelector);
  const mapState: MapState = useSelector(mapStateSelector.bind(id));

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
  const activeChannel: Channel = useSelector(channelSelector.bind(activeChannelName));
  const currentPlastCode = useSelector(currentPlastCodeSelector);

  // обновление списка связанных карт
  useEffect(() => {
    const canvases = getMultiMapChildrenCanvases(mapsState.multi, mapsState.single, id, parent);
    if (scroller.current) scroller.current.setList(canvases);
  }, [mapsState, mapState, id, parent]);

  useEffect(() => {
    if (!mapState || !isPartOfDynamicMultiMap) return;
    if (!mapState.mapID && data.layers) {
      dispatch(setMapField(id, 'mapID', data));
      dispatch(loadMapSuccess(id, data));
    }
  }, [isPartOfDynamicMultiMap, mapState, id, data, dispatch]);

  // проверка параметров формы
  useEffect(() => {
    if (!mapState || isPartOfDynamicMultiMap) return;
    const rows = activeChannel?.data?.rows;
    if (!rows || rows.length === 0) {
      if (mapState?.isLoadSuccessfully === false) return;
      dispatch(loadMapError(id));
      return setIsMapExist(false);
    }

    // если карта загружена, но параметры были сброшены
    if (mapData?.layers && mapState?.isLoadSuccessfully === false) {
      dispatch(setMapField(id, 'isLoadSuccessfully', true));
      return;
    }

    setIsMapExist(true);

    const mapInfo = rows[0];
    const owner = mapInfo.Cells[12];
    const mapID = String(mapInfo.Cells[0]);

    const changeOwner = owner !== mapState.owner;
    const changeMapID = mapID !== mapState.mapID;
    const objectName = activeChannel.info.currentRowObjectName;

    if (objectName && (changeOwner || changeMapID)) {
      const value = tableRowToString(activeChannel, mapInfo)
      dispatch(updateParam(parent, objectName, value));
    }
    if (changeOwner) {
      dispatch(setMapField(id, 'owner', owner));
    }
    if (changeMapID) {
      setProgress(0);
      dispatch(setMapField(id, 'mapID', mapID));
      dispatch(fetchMapData(id, mapID, owner, setProgress));
    }
  }, [mapState, activeChannel, id, parent, isPartOfDynamicMultiMap, dispatch]); // eslint-disable-line

  const draw = useCallback((canvas, map, scale, x, y, selected) => {
    if (!mapState?.drawer || !canvas) return;
    if (mapDrawnData.current) mapDrawnData.current.emit('detach');
    const data = {centerx: x, centery: y, scale, selected};
    mapDrawnData.current = mapState.drawer.showMap(canvas, map, data);
  }, [mapState?.drawer]);

  const updateCanvas = useCallback((viewport: MapViewport, context?) => {
    if (!mapData) return;
    let x,y, scale;
    if (viewport) {
      x = viewport.centerX; y = viewport.centerY;
      scale = viewport.scale;
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
    if (!mapData) return;
    let pointsData: MapPoint[];
    if (isPartOfDynamicMultiMap) {
      const currentMapID = parent + ',' + mapsState.multi[parent].configs
        .find(c => c.data.plastCode === currentPlastCode)?.id
      const activeMapState : MapState = mapsState.single[currentMapID];
      if (!activeMapState?.mapData) return;
      const isSync = mapsState.multi[parent].sync;
      const isActiveMap = currentMapID === id

      if (isActiveMap) pointsData = mapData.points
      if (isSync && !isActiveMap) pointsData = activeMapState.mapData.points
      if (!isSync && !isActiveMap) return null;
    } else {
      pointsData = mapData.points
    }

    const point = pointsData.find(p => parseInt(p.UWID) === wellID);
    if (point && scroller.current) {
      const scale = mapData.scale < maxScale ? mapData.scale : maxScale;
      return {centerX: point.x, centerY: point.y, scale};
    }
    return null;
  }, [
    mapData, currentPlastCode, id, parent, isPartOfDynamicMultiMap,
    mapsState.multi, mapsState.single
  ]);

  const wellsMaxScale = useMemo(() => {
    return mapData?.layers?.find(l => l.elementType === 'sign')?.highscale ?? 50_000;
  }, [mapData?.layers]);

  // подстраивание карты под выбранную скважину
  useEffect(() => {
    if (!currentWell?.id) return;
    const cs = getWellCS(currentWell.id, wellsMaxScale);
    if (cs) updateCanvas(cs);
  }, [currentWell?.id, getWellCS, wellsMaxScale, updateCanvas]);

  // закрепление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current && canvasRef.current !== canvas && mapData) {
      dispatch(setMapField(id, 'canvas', canvasRef.current));

      scroller.current
        ? scroller.current.setCanvas(canvasRef.current)
        : scroller.current = new Scroller(canvasRef.current);
      if (!mapState.scroller) dispatch(setMapField(id, 'scroller', scroller.current));

      const cs =
        getWellCS(currentWell?.id, wellsMaxScale) ||
        getFullViewport(mapData.layers, canvasRef.current);

      // случай, когда вкладка карт не была открыта и приосходит редактирование трассы
      if (!mapData.onDrawEnd) mapData.onDrawEnd = (canvas, x, y, scale) => {
        utils.pointToMap = getPointToMap(canvas, x, y, scale);
      };
      updateCanvas(cs, canvasRef.current);
    }
  });

  const traceRef = useRef<{id: TraceID, editing: boolean}>(null);

  // отрисовка текущей трассы
  useEffect( () => {
    if (!mapState?.isLoadSuccessfully) return;
    const updateViewport =
      currentTrace?.id !== traceRef.current?.id ||           // изменилась активная трасса
      (traceEditing && traceRef.current?.editing === false); // вошли в режим режактирования
    dispatch(applyTraceToMap(id, currentTrace, updateViewport));
    traceRef.current = {id: currentTrace?.id, editing: traceEditing};
  }, [mapState?.isLoadSuccessfully, currentTrace, traceEditing, id, dispatch]);

  // добавление/удаление точек к текущей трассе через клик по карте
  const mouseDown = useCallback((event: MouseEvent) => {
    if (!currentTrace || !traceEditing) return;
    if (!mapData || !mapState.isLoadSuccessfully) return;

    const eventPoint = utils.pointToMap(clientPoint(event));
    const changed = handleClick(currentTrace, eventPoint, mapData);
    if (changed) dispatch(setCurrentTrace({...currentTrace}));
  }, [mapState?.isLoadSuccessfully, mapData, utils, currentTrace, traceEditing, dispatch]);

  // добавление слушателей событий для добавления/удаления точек трассы через клик по скважинам
  useEffect(() => {
    if (!canvas) return;
    if (traceEditing) {
      canvas.addEventListener('mousedown', mouseDown, listenerOptions);
    } else {
      canvas.removeEventListener('mousedown', mouseDown);
    }
    return () => canvas.removeEventListener('mousedown', mouseDown);
  }, [traceEditing, mouseDown, canvas]);

  if (!mapState) {
    return <div/>;
  }
  if (!isMapExist) {
    return <MapNotFound t={t}/>;
  }
  if (mapState.isLoadSuccessfully === undefined) {
    return <CircularProgressBar percentage={progress} size={100}/>;
  }
  if (mapState.isLoadSuccessfully === false) {
    return <MapLoadError t={t}/>;
  }

  return (
    <div className={'map-container'}>
      <canvas style={{cursor: mapState.cursor}} ref={canvasRef}/>
    </div>
  );
};
