import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Scroller } from '../drawer/scroller';
import { MapNotFound, MapLoadError} from '../../multi-map/multi-map-item';
import { getFullViewport, getMultiMapChildrenCanvases} from '../lib/map-utils';
import { mapsStateSelector, mapStateSelector } from '../store/maps.selectors';
import {
  setMapField,
  loadMapSuccess,
  addMapLayer,
  setActiveLayer,
  startCreatingElement,
  createMapElement,
  setEditMode,
  setCurrentTrace,
} from '../store/maps.actions';
import { fetchMapData } from '../store/maps.thunks';
import {stringToTableCell, tableRowToString} from 'entities/parameters/lib/table-row';
import { updateParam, currentWellIDSelector } from 'entities/parameters';
import { channelSelector } from 'entities/channels';
import { CircularProgressBar } from 'shared/ui';
import {
  getCurrentTraceParamName,
  getCurrentTraceMapElement,
  traceLayerProto,
  tracesChannelName
} from "../lib/traces-utils";
import {MapModes} from "../lib/enums";
import {TracesEditWindow} from "./edit-panel/editing/traces-edit-window";

export const Map = ({id: formID, parent, channels, data}: FormState & {data?: MapData}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentWellID = useSelector(currentWellIDSelector);
  const mapsState = useSelector(mapsStateSelector);
  const mapState: MapState = useSelector(mapStateSelector.bind(formID));

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

  // обновление списка связанных карт
  useEffect(() => {
    const canvases = getMultiMapChildrenCanvases(mapsState.multi, mapsState.single, formID);
    if (scroller.current) scroller.current.setList(canvases);
  }, [mapsState, mapState, formID]);

  useEffect(() => {
    if (!mapState || !isPartOfDynamicMultiMap) return;
    if (!mapState.mapID && data.layers) {
      dispatch(setMapField(formID, 'mapID', data));
      dispatch(loadMapSuccess(formID, data));
    }
  }, [isPartOfDynamicMultiMap, mapState, formID, data, dispatch]);

  // проверка параметров формы
  useEffect(() => {
    if (!mapState || isPartOfDynamicMultiMap) return;
    const rows = activeChannel?.data?.rows;
    if (!rows || rows.length === 0) return setIsMapExist(false);

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
      dispatch(setMapField(formID, 'owner', owner));
    }
    if (changeMapID) {
      setProgress(0);
      dispatch(setMapField(formID, 'mapID', mapID));
      dispatch(fetchMapData(formID, mapID, owner, setProgress));
    }
  }, [mapState, activeChannel, formID, parent, isPartOfDynamicMultiMap, dispatch]);

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
      dispatch(setMapField(formID, 'canvas', canvasRef.current));

      scroller.current
        ? scroller.current.setCanvas(canvasRef.current)
        : scroller.current = new Scroller(canvasRef.current);
      if (!mapState.scroller) dispatch(setMapField(formID, 'scroller', scroller.current));

      const cs = getWellCS(currentWellID, wellsMaxScale) || getFullViewport(mapData.layers, canvasRef.current);
      updateCanvas(cs, canvasRef.current);
    }
  });

  // создание слоя для трасс
  useEffect( () => {
    if (!mapState?.isLoadSuccessfully ||
      mapData.layers.find(layer => layer.uid==='{TRACES-LAYER}')) return;

    dispatch(addMapLayer(formID, traceLayerProto));
  }, [formID, mapState?.isLoadSuccessfully, dispatch, mapData?.layers]);

  // получение списка трасс из каналов
  const traces: Channel = useSelector(channelSelector.bind(tracesChannelName));

  const currentTraceParamName = getCurrentTraceParamName(traces);

  // получение значения текущей трассы из параметров
  const currentTraceParamValue = useSelector<WState, string | null>(
    (state: WState) =>
      state.parameters[state.root.id]
        .find(el => el.id === currentTraceParamName)
        ?.value?.toString() || null
  )

  // создание и отрисовка текущей трассы
  useEffect( () => {
    if (!mapState?.isLoadSuccessfully ||
      !mapData
    ) return;

    if (!traces) return;

    const traceLayer = mapData.layers.find(layer => layer.uid==='{TRACES-LAYER}');
    if (!traceLayer) return;
    traceLayer.elements = [];

    if (!currentTraceParamValue) {
      dispatch(setCurrentTrace(formID, null));
      return;
    }

    // установка mapState.currentTraceRow
    const currentTraceRowCells = {
      ID: +stringToTableCell(currentTraceParamValue, 'ID'),
      name: stringToTableCell(currentTraceParamValue, 'NAME'),
      stratumID: stringToTableCell(currentTraceParamValue, 'STRATUM_ID'),
      items: stringToTableCell(currentTraceParamValue, 'ITEMS')
    };
    const currentTraceRowID = traces.data.rows.find(row => row.Cells[0] === currentTraceRowCells?.ID)?.ID;
    if(!currentTraceRowID) return;
    const currentTraceRow = {ID: currentTraceRowID, Cells: currentTraceRowCells};
    dispatch(setCurrentTrace(formID, currentTraceRow));

    // получение элемента трассы для карты
    const traceElement= getCurrentTraceMapElement(
      formID,
      mapData.points,
      currentTraceRowCells,
    );
    if (!traceElement) return;

    dispatch(setActiveLayer(formID, traceLayerProto));
    dispatch(startCreatingElement(formID));
    dispatch(createMapElement(formID, traceElement));
    dispatch(setEditMode(formID, MapModes.NONE));
    dispatch(setActiveLayer(formID, null));
  }, [formID, mapState?.isLoadSuccessfully, mapData, traces, currentTraceParamValue, dispatch, mapState?.isTraceEditing]);

  // обновление карты при изменении значения текущей трассы в параметрах
  useEffect( () => {
    mapState?.utils.updateCanvas()
  }, [mapData?.layers, currentTraceParamValue, mapState?.utils, mapState?.isTraceEditing]);

  if (!mapState) return null;
  if (!isMapExist) return <MapNotFound t={t}/>;
  if (mapState.isLoadSuccessfully === undefined) return <CircularProgressBar percentage={progress} size={100}/>;
  if (mapState.isLoadSuccessfully === false) return <MapLoadError t={t}/>;

  return (
    <div className={ mapState?.isTraceEditing ? 'map-container trace-edit-panel-open' : 'map-container'}>
      { mapState?.isTraceEditing && <TracesEditWindow formID={formID} mapState={mapState} traces={traces}/> }
      <canvas style={{cursor: mapState.cursor}} ref={canvasRef}/>
    </div>
  );
};
