import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Loader } from "@progress/kendo-react-indicators";
import { getMapsDrawer } from "./Map/map-loader.js";
import { compareArrays, getParentFormId, tableRowToString } from "../../utils";
import { getFullViewport } from "./Map/map-utils";
import { createMapState, setMapField, setMapOwner } from "../../store/actionCreators/maps.actions";
import { fetchMapData } from "../../store/thunks";


const mapToAppState = (state) => {
  //console.log(state)
  return [state.appState.config.data, state.appState.sessionID.data, state.sessionManager];
};

// Система подготовки (PREPARE_SYSTEM): Баяндыское -> D3fm -> 28 -> Карта изобар

export default function Map({formData: {id: formID}, data}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [{root, webServicesURL}, sessionID, sessionManager] = useSelector(mapToAppState, compareArrays);
  const activeChannel = useSelector(state => state.channelsData[data.activeChannels[0]]);
  /** @type MapState */
  const mapState = useSelector(state => state.maps[formID]);

  const mapData = mapState?.mapData;
  const canvas = mapState?.canvas;
  const selectedElement = mapState?.element;
  const utils = mapState?.utils;

  const mapDrawnData = useRef(null);
  const [isMapExist, setIsMapExist] = useState(false);

  // добавление состояния в хранилище состояний карт
  useEffect(() => {
    if (!mapState) dispatch(createMapState(formID));
  }, [mapState, dispatch, formID]);

  const getDrawer = useCallback((owner) => {
    return getMapsDrawer(sessionID, formID, owner, sessionManager, webServicesURL, root);
  }, [formID, sessionManager, sessionID, webServicesURL, root]);

  const draw = useCallback((canvas, map, scale, x, y, selected) => {
    if (!mapState || !mapState.drawer) return;
    if (mapDrawnData.current) mapDrawnData.current.emit('detach');
    const data = {centerx: x, centery: y, scale, selected};
    const drawnData = mapState.drawer.showMap(canvas, map, data)
      .on('update.begin', () => {
        const context = {
          center: {x: drawnData.centerx, y: drawnData.centery},
          scale: drawnData.scale,
        };
        mapState.drawer.checkIndex(map, context);
      });
    mapDrawnData.current = drawnData;
  }, [mapState]);

  // проверка параметров формы
  useEffect(() => {
    if (!mapState) return;
    if (!(activeChannel?.data?.Rows && activeChannel.data.Rows.length > 0))
      return setIsMapExist(false);

    setIsMapExist(true);

    const mapInfo = activeChannel.data.Rows[0];
    const owner = mapInfo.Cells[12];
    const mapID = String(mapInfo.Cells[0]);

    const changeOwner = owner !== mapState.owner;
    const changeMapID = mapID !== mapState.mapID;

    if (changeOwner || changeMapID || activeChannel.currentRowObjectName) {
      sessionManager.paramsManager.updateParamValue(
        getParentFormId(formID), activeChannel.currentRowObjectName,
        tableRowToString(activeChannel, mapInfo)?.value, true
      );
    }
    if (changeOwner) {
      dispatch(setMapOwner(formID, owner, getDrawer(owner)));
    }
    if (changeMapID && mapState.drawer && canvas) {
      dispatch(setMapField(formID, 'mapID', mapID));

      const callback = (loadedMap) => {
        new mapState.drawer.Scroller(canvas);
        canvas.blocked = false;

        loadedMap.pointsData.then(() => {
          const view = getFullViewport(loadedMap.layers, canvas);
          draw(canvas, loadedMap, view.scale, view.centerx, view.centery, null);
        });
      }
      dispatch(fetchMapData(formID, mapID, mapState.drawer.loadMap, callback));
    }
  }, [formID, mapState, dispatch, activeChannel, getDrawer, sessionManager, canvas, draw]);

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
    draw(context ?? canvas, mapData, scale, x, y, selectedElement);
  }, [draw, mapData, selectedElement, canvas]);

  const canvasRef = useRef(null);

  // переопределение функции updateCanvas
  useEffect(() => {
    if (utils) return utils.updateCanvas = updateCanvas;
  }, [utils, updateCanvas]);

  // закрепление ссылки на холст
  useLayoutEffect(() => {
    if (!mapState) return;
    if (!mapState.canvas && canvasRef.current !== canvas) {
      dispatch(setMapField(formID, 'canvas', canvasRef.current));
    }
  }, [mapState, canvas, dispatch, formID]);

  const loader = <Loader type={'infinite-spinner'} size={'large'}/>;
  if (!mapState) return <div className={'map-container loading'}>{loader}</div>;

  const isLoading = isMapExist && mapState.isLoadSuccessfully === undefined;
  const isFailed = isMapExist && mapState.isLoadSuccessfully === false;
  const display = (mapState.isLoadSuccessfully && isMapExist) ? undefined : 'none'

  return (
    <div className={`map-container ${isLoading ? 'loading' : ''}`}>
      {!isMapExist && <div className={'map-not-found'}>{t('map.not-found')}</div>}
      {isLoading && loader}
      {isFailed && <div>Не удалось загрузить карту.</div>}
      <canvas style={{cursor: mapState.cursor, display}} ref={canvasRef}/>
    </div>
  );
}
