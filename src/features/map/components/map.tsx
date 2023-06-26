import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Scroller } from '../drawer/scroller';
import { MapNotFound, MapLoadError} from '../../multi-map/multi-map-item';
import {
  clientPoint, getFullViewport, getMultiMapChildrenCanvases, getPointToMap,
  listenerOptions, PIXEL_PER_METER
} from '../lib/map-utils';
import { mapsStateSelector, mapStateSelector } from '../store/maps.selectors';
import {
  setMapField, loadMapSuccess, loadMapError,
  addMapLayer, setActiveLayer, startCreatingElement,
  createMapElement, acceptMapEditing, clearMapSelect, setOnDrawEnd,
} from '../store/maps.actions';
import { fetchMapData } from '../store/maps.thunks';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { updateParam, currentWellIDSelector, currentPlastCodeSelector} from 'entities/parameters';
import { channelSelector } from 'entities/channels';
import { CircularProgressBar } from 'shared/ui';
import { getCurrentTraceMapElement, traceLayerProto, getNearestSignMapElement, findMapPoint } from '../lib/traces-map-utils';
import { traceStateSelector } from '../../../entities/traces/store/traces.selectors';
import { setTraceItems } from '../../../entities/traces/store/traces.actions';


export const Map = ({id, parent, channels, data}: FormState & {data?: MapData}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentWellID = useSelector(currentWellIDSelector);
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
    const canvases = getMultiMapChildrenCanvases(mapsState.multi, mapsState.single, id);
    if (scroller.current) scroller.current.setList(canvases);
  }, [mapsState, mapState, id]);

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
      const value = tableRowToString(activeChannel, mapInfo)?.value;
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
    if (!mapData) return;
    let pointsData;
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

    const point = pointsData.find(p => p.name === wellID);
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
    const layers = mapData?.layers;
    if (!layers) return 50_000;
    for (const { elements, highscale } of layers) {
      if (elements.length && elements[0].type === 'sign') return highscale;
    }
    return 50_000;
  }, [mapData?.layers]);

  // подстраивание карты под выбранную скважину
  useEffect(() => {
    if (!currentWellID) return;
    const cs = getWellCS(currentWellID, wellsMaxScale);
    if (cs) updateCanvas(cs, canvasRef.current);
  }, [currentWellID, getWellCS, wellsMaxScale, updateCanvas]);

  // закрепление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current && canvasRef.current !== canvas && mapData) {
      dispatch(setMapField(id, 'canvas', canvasRef.current));

      scroller.current
        ? scroller.current.setCanvas(canvasRef.current)
        : scroller.current = new Scroller(canvasRef.current);
      if (!mapState.scroller) dispatch(setMapField(id, 'scroller', scroller.current));

      const cs =
        getWellCS(currentWellID, wellsMaxScale) ||
        getFullViewport(mapData.layers, canvasRef.current);
      updateCanvas(cs, canvasRef.current);
    }
  });

  // создание слоя для трасс
  useEffect( () => {
    // проверка на существование слоя для трасс
    if (!mapState?.isLoadSuccessfully ||
      mapData.layers.find(layer => layer.uid==='{TRACES-LAYER}')) return;

    // создание слоя
    dispatch(addMapLayer(id, traceLayerProto));
  }, [id, mapState?.isLoadSuccessfully, dispatch, mapData?.layers]);

  // получение хранилища трасс трасс
  const traceState = useSelector(traceStateSelector);
  const traceLayer = mapData?.layers?.find(layer => layer.uid==='{TRACES-LAYER}');

  const getTraceCS = useCallback((traceElement) => {
    if (!canvas?.width || !canvas?.height || !traceElement || !mapData?.scale) return;
    if (traceElement && scroller.current) {
      const minX = traceElement.bounds.min.x;
      const minY = traceElement.bounds.min.y;
      const maxX = traceElement.bounds.max.x;
      const maxY = traceElement.bounds.max.y;

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // размеры прямоугольника, описывающего трассу
      const lengthX = Math.abs(Math.abs(maxX) - Math.abs(minX));
      const lengthY = Math.abs(Math.abs(maxY) - Math.abs(minY));

      const newScale = Math.max(lengthX/canvas.width,
        lengthY/canvas.height)* PIXEL_PER_METER * 1.4;

      if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(newScale)) return null;
      const scale = newScale;
      return {centerX, centerY, scale};
    }
    return null;
  }, [mapData?.scale, canvas]); // canvas не стоит в зависимостях намеренно

  // создание и отрисовка текущей трассы
  useEffect( () => {
    // если данные карты не загружены
    if (!mapState?.isLoadSuccessfully || !mapData?.points) return;

    // если не сущетсвует слоя для трасс
    if (!traceLayer) return;
    traceLayer.elements = [];

    // если в трассе нет скважин
    if (!traceState?.currentTraceData?.items) {
      mapState?.utils.updateCanvas();
      return;
    }

    // получение элемента трассы для карты
    const traceElement= getCurrentTraceMapElement(
      id,
      mapData?.points,
      traceState?.currentTraceData,
    );
    // если не удалось получить элемент трассы для карты
    if (!traceElement) return;

    dispatch(setActiveLayer(id, traceLayerProto));

    // отрисовка трассы на карте
    dispatch(startCreatingElement(id));
    dispatch(createMapElement(id, traceElement));
    dispatch(acceptMapEditing(id));
    dispatch(clearMapSelect(id));
    dispatch(setActiveLayer(id, null));

    // подстраивание карты под выбранную трассу после окончания редактирования
    // и при изменении в параметрах
    if (!traceState.isTraceEditing) {
      const cs = getTraceCS(traceElement);
      if (cs) updateCanvas(cs, canvasRef.current);
    }
  }, [id, mapState?.isLoadSuccessfully, mapData?.points, traceState?.currentTraceData, dispatch,
    traceState?.isTraceEditing, traceState?.isTraceCreating, mapState?.utils, traceLayer,
    getTraceCS, updateCanvas]);


  // добавление/удаление точек к текущей трассе через клик по карте
  const mouseDown = useCallback((event: MouseEvent) => {
    if(!traceState?.isTraceEditing) return;

    const { canvas, utils, mapData } = mapState;

    if (!mapData) return;
    if (!mapState?.isLoadSuccessfully) return;

    const point = utils.pointToMap(clientPoint(event));

    // получение элемента скважины на карте
    const newPoint = getNearestSignMapElement(point, canvas, mapData.scale, mapData.layers);
    if (!newPoint) return;
    // получение точки из MapData.points соответсвующей выбраному элементу на карте
    const newDataPoint: MapPoint = findMapPoint(newPoint, mapData.points)
    if (!newDataPoint?.UWID || !newDataPoint?.name) return;

    const uwID = parseInt(newDataPoint.UWID);
    const items = traceState?.currentTraceData?.items || [];

    const pointExistInTrace = !!items?.find(p => p === uwID);

    let newItems;
    if (pointExistInTrace) {
      newItems = items.filter(p => p !== uwID)
    } else {
      newItems = [...items, uwID]
    }

    if(newDataPoint) dispatch(setTraceItems(newItems))
  }, [mapState, dispatch, traceState?.isTraceEditing, traceState?.currentTraceData?.items]);

  // добавление слушателей событий для добавления/удаления точек трассы через клик по скважинам
  useEffect(() => {
    if (!canvas) return;
    if (traceState?.isTraceEditing) {
      canvas.addEventListener('mousedown', mouseDown, listenerOptions);
    } else {
      canvas.removeEventListener('mousedown', mouseDown);
    }
    return () => canvas.removeEventListener('mousedown', mouseDown);
  }, [traceState.isTraceEditing, mouseDown, canvas])

  const onDrawEnd = useCallback((canvas, x, y, scale) => {
    if(!mapState) return;
    mapState.utils.pointToMap = getPointToMap(canvas, x, y, scale);
  }, [mapState]);

  // переопределение метода pointToMap при обновлении карты для получения корректных координат точек
  useEffect(() => {
    if (mapState?.mapData) dispatch(setOnDrawEnd(id, onDrawEnd));
  }, [mapState, onDrawEnd, dispatch, id]);

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
