import React, { useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Loader } from "@progress/kendo-react-indicators";
import { Scroller } from "./Map/drawer/scroller";
import { createMapsDrawer } from "./Map/drawer";
import { getParentFormId, tableRowToString } from "../../utils";
import { getFullViewport, getMultiMapChildrenCanvases } from "./Map/map-utils";
import { fetchMapData } from "../../store/thunks";
import { actions, selectors } from "../../store";


export default function Map({formData: {id: formID}, data}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const parentForm = getParentFormId(formID);

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const activeChannel = useSelector(selectors.channel.bind(data.activeChannels[0]));
  const mapsState = useSelector(selectors.mapsState);
  /** @type MapState */
  const mapState = useSelector(selectors.mapState.bind(formID));

  const canvasRef = useRef(null);
  const mapDrawnData = useRef(null);
  const scroller = useRef(null);
  const [isMapExist, setIsMapExist] = useState(false);

  const canvas = mapState?.canvas;
  const mapData = mapState?.mapData;
  const selectedElement = mapState?.element;
  const utils = mapState?.utils;

  const getDrawer = useCallback((owner) => {
    return createMapsDrawer(sessionManager, sessionID, formID, owner);
  }, [formID, sessionManager, sessionID]);

  // обновление списка связанных карт
  useEffect(() => {
    const canvases = getMultiMapChildrenCanvases(mapsState.multi, mapsState.single, formID);
    if (scroller.current) scroller.current.setList(canvases);
  }, [mapsState, mapState, formID]);

  // добавление состояния в хранилище состояний карт
  useEffect(() => {
    if (!mapState) dispatch(actions.createMapState(formID, getDrawer('Common')));
  }, [mapState, getDrawer, dispatch, formID]);

  const draw = useCallback((canvas, map, scale, x, y, selected) => {
    if (!mapState?.drawer || !canvas) return;
    if (mapDrawnData.current) mapDrawnData.current.emit('detach');
    const data = {centerx: x, centery: y, scale, selected};
    mapDrawnData.current = mapState.drawer.showMap(canvas, map, data);
  }, [mapState?.drawer]);

  // проверка параметров формы
  useEffect(() => {
    if (!mapState) return;
    if (!(activeChannel?.data?.Rows && activeChannel.data['Rows'].length > 0))
      return setIsMapExist(false);

    setIsMapExist(true);

    const mapInfo = activeChannel.data['Rows'][0];
    const owner = mapInfo.Cells[12];
    const mapID = String(mapInfo.Cells[0]);

    const changeOwner = owner !== mapState.owner;
    const changeMapID = mapID !== mapState.mapID;

    if (changeOwner || changeMapID || activeChannel.currentRowObjectName) {
      sessionManager.paramsManager.updateParamValue(
        parentForm, activeChannel.currentRowObjectName,
        tableRowToString(activeChannel, mapInfo)?.value, true
      );
    }
    if (changeOwner) {
      dispatch(actions.setMapField(formID, 'owner', owner));
      mapState.drawer.changeOwner(owner);
    }
    if (changeMapID) {
      dispatch(actions.setMapField(formID, 'mapID', mapID));
      dispatch(fetchMapData(formID, mapID, mapState.drawer.loadMap));
    }
  }, [mapState, activeChannel, getDrawer, sessionManager, draw, sessionID, formID, parentForm, dispatch]);

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
    if (utils) return utils.updateCanvas = updateCanvas;
  }, [utils, updateCanvas]);

  // закрепление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current && canvasRef.current !== canvas) {
      dispatch(actions.setMapField(formID, 'canvas', canvasRef.current));

      scroller.current
        ? scroller.current.setCanvas(canvasRef.current)
        : scroller.current = new Scroller(canvasRef.current);
      if (!mapState.scroller) dispatch(actions.setMapField(formID, 'scroller', scroller.current));

      updateCanvas(getFullViewport(mapData.layers, canvasRef.current), canvasRef.current);
    }
  });

  if (!mapState) return <MapLoading/>;
  if (!isMapExist) return <MapNotFound t={t}/>;
  if (mapState.isLoadSuccessfully === undefined) return <MapLoading/>;
  if (mapState.isLoadSuccessfully === false) return <MapLoadError t={t}/>;

  return (
    <div className={'map-container'}>
      <canvas style={{cursor: mapState.cursor}} ref={canvasRef}/>
    </div>
  );
}

function MapLoading() {
  return (
    <div className={'map-container loading'}>
      <Loader type={'infinite-spinner'} size={'large'}/>
    </div>
  );
}

function MapNotFound({t}) {
  return <div className={'map-not-found'}>{t('map.not-found')}</div>;
}

function MapLoadError({t}) {
  return <div className={'map-not-found'}>{t('map.not-loaded')}</div>;
}
