import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Loader } from "@progress/kendo-react-indicators";
import { getMapsDrawer } from "./Map/map-loader.js";
import { compareArrays, getParentFormId, tableRowToString } from "../../utils";
import { getFullViewport } from "./Map/map-utils";
import { createMapState, setMapField } from "../../store/actionCreators/maps.actions";
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
  //const ownersChannel = useSelector(state => state.channelsData['LocalMapsOwners']);
  //const formParams = useSelector(state => state.formParams[getParentFormId(formID)]);
  /** @type MapState */
  const mapState = useSelector(state => state.maps[formID]);

  const canvasRef = useRef(null);
  const mapDrawnData = useRef(null);
  const [isMapExist, setIsMapExist] = useState(false);

  const canvas = mapState?.canvas;
  const mapData = mapState?.mapData;
  const selectedElement = mapState?.element;
  const utils = mapState?.utils;

  const getDrawer = useCallback((owner) => {
    return getMapsDrawer(sessionID, formID, owner, sessionManager, webServicesURL, root);
  }, [formID, sessionManager, sessionID, webServicesURL, root]);

  // добавление состояния в хранилище состояний карт
  useEffect(() => {
    if (!mapState) dispatch(createMapState(formID, getDrawer('Common')));
  }, [mapState, getDrawer, dispatch, formID]);

  const draw = useCallback((canvas, map, scale, x, y, selected) => {
    if (!mapState?.drawer || !canvas) return;
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
  }, [mapState?.drawer]);

  // проверка параметров формы
  useEffect(() => {
    if (!mapState) return;

    // if (ownersChannel?.data?.Rows && formParams?.length > 0) {
    //   const rows = ownersChannel.data.Rows;
    //   const user = formParams.find(param => param.id === 'currentUser')?.value;
    //
    //   if (user && rows.length === 1) {
    //     const newRow = {Cells: [user, 'Пользовательская', 'Пользовательская'], ID: null};
    //     rows.push(newRow);
    //   }
    //   if (user && rows.length === 2) {
    //     if (rows[1].Cells[1] === 'Пользовательская' && rows[1].Cells[0] !== user)
    //       rows[1].Cells[0] = user;
    //   }
    // }

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
      dispatch(setMapField(formID, 'owner', owner));
      mapState.drawer.changeOwner(owner);
    }
    if (changeMapID) {
      dispatch(setMapField(formID, 'mapID', mapID));
      dispatch(fetchMapData(formID, mapID, mapState.drawer.loadMap));
    }
  }, [formID, mapState, dispatch, activeChannel, getDrawer, sessionManager, draw]);

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
    if (canvasRef.current && canvasRef.current !== canvas && mapState?.drawer) {
      dispatch(setMapField(formID, 'canvas', canvasRef.current));
      new mapState.drawer.Scroller(canvasRef.current);
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
