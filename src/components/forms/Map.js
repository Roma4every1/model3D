import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useImperativeHandle } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getMapsDrawer } from "./Map/MapLoader.js";
import { getParentFormId, tableRowToString } from "../../utils";
import { translator, distance } from "./Map/maps/src/geom";
import pixelPerMeter from "./Map/maps/src/pixelPerMeter";
import setFormRefs from "../../store/actionCreators/setFormRefs";


// Система подготовки (PREPARE_SYSTEM)
// Баяндыское -> D3fm -> 28 -> Карта изобар

/*
 * point: {x: number, y: number},
 * scale: number,
 * map: {
 *   date, eTag, layers,
 *   mapCode, mapData, mapError, mapName,
 *   namedPoints, objectCode, objectName,
 *   organization, owner,
 *   plastCode, plastName,
 *   pointsData, points
 * }
 *
 * map.points: Array<{x, y, name, UWID, attrTable}>
 * */
const getNearestNamedPoint = (point, scale, map) => {
  const SELECTION_RADIUS = 0.015;
  let minRadius, nearestNP = null;

  map.points.forEach((p) => {
    const localDist = distance(p.x, p.y, point.x, point.y);

    if (!minRadius || localDist < minRadius) {
      minRadius = localDist;
      if ((minRadius / scale) < SELECTION_RADIUS) nearestNP = p;
    }
  });

  return nearestNP;
};

function Map({formData, data}, ref) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [mapInfo, setMapInfo] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [mapDrawnData, setMapDrawnData] = useState(null);

  const { root, webServicesURL } = useSelector(state => state.appState.config.data);
  const sessionID = useSelector(state => state.sessionId);
  const sessionManager = useSelector(state => state.sessionManager);
  const cursor = useSelector(state => state.formRefs[formData.id + '_cursor']);
  const databaseData = useSelector((state) => state.channelsData[data.activeChannels[0]]);

  const selectedObject = useRef(null);
  const centerScaleChangingHandler = useRef(null);
  const drawer = useRef(null);

  const setSelectedObject = useCallback((newSelected) => {
    selectedObject.current = newSelected;
    dispatch(setFormRefs(formData.id + '_selectedObject', newSelected));
  }, [dispatch, formData.id]);

  const getCenterScale = useCallback(() => ({
    scale: mapDrawnData?.scale ?? 10000,
    centerx: Math.round(mapDrawnData?.centerx ?? 0),
    centery: Math.round(mapDrawnData?.centery ?? 0),
  }), [mapDrawnData]);

  const draw = useCallback((canvas, map, scale, centerX, centerY, selected, redrawnHandler) => {
    const mapDataD = drawer.current.showMap(canvas, map, {
      scale, selected, centerx: centerX, centery: centerY,
    })
      .on('update.begin', () => {
        const context = {
          center: {x: mapDataD.centerx, y: mapDataD.centery},
          scale: mapDataD.scale,
        };
        drawer.current.checkIndex(map, context);
      })
      .on('update.end', (canvas) => {
        if (redrawnHandler) redrawnHandler(canvas);
      })
      .on('pointPicked', (point, scale) => {
        if (!_viewRef.current.blocked && !_viewRef.current.selectingMode) {
          const nearestObject = getNearestNamedPoint(point, scale, map);
          if (nearestObject) {
            const newSelectedObject = nearestObject.UWID ? [nearestObject.UWID] : null;
            setSelectedObject(newSelectedObject);
            draw(canvas, map, mapDataD.scale, mapDataD.centerx, mapDataD.centery, newSelectedObject)
            nearestObject.id = nearestObject.UWID;
            nearestObject.selected = true;
          }
        }
      });

    setMapDrawnData(mapDataD);
  }, [setSelectedObject]);

  const updateCanvas = useCallback((newCS, context, redrawnHandler) => {
    const cs = newCS ?? getCenterScale();
    if (centerScaleChangingHandler?.current) centerScaleChangingHandler.current(cs);

    mapDrawnData.emit('detach');
    draw(context ?? _viewRef.current, mapData, cs.scale, cs.centerx, cs.centery, selectedObject?.current, redrawnHandler);
  }, [draw, mapData, getCenterScale, mapDrawnData]);

  /* setMapInfo: если нет данных, то пишется, что карта не найдена */
  useEffect(() => {
    if (databaseData?.data?.Rows && databaseData.data.Rows.length > 0) {
      if (databaseData.currentRowObjectName) {
        sessionManager.paramsManager.updateParamValue(
          getParentFormId(formData.id),
          databaseData.currentRowObjectName,
          tableRowToString(databaseData, databaseData.data.Rows[0])?.value,
          true
        );
      }
      setMapInfo(databaseData.data.Rows[0]);
    } else {
      setMapInfo(null);
    }
  }, [databaseData, formData, sessionManager]);

  useEffect(() => {
    let ignore = false;
    dispatch(setFormRefs(formData.id + '_activeLayer', null));
    if (mapInfo) {
      async function fetchData() {
        const mapId = mapInfo.Cells[0];
        const owner = mapInfo.Cells[12];
        drawer.current = getMapsDrawer(sessionID, formData.id, owner, sessionManager, webServicesURL, root);
        let loadedMap = await drawer.current.loadMap(String(mapId), { center: { x: 0, y: 0 }, scale: 10000 });

        if (!ignore) {
          new drawer.current.Scroller(_viewRef.current);
          _viewRef.current.blocked = false;

          dispatch(setFormRefs(formData.id + '_mapData', null));
          dispatch(setFormRefs(formData.id + '_mapData', loadedMap));
          dispatch(setFormRefs(formData.id + '_selectedObjectEditing', false));
          setMapData(loadedMap);

          let centerX = 0, centerY = 0;
          draw(_viewRef.current, loadedMap, 10000, centerX, centerY, null);
          loadedMap.pointsData.then(points => {
            if (points) {
              const np = points.find(function (it) {
                return it.debit
              }) || points[0];

              if (np) {
                centerX = np.x;
                centerY = np.y;
              } else {
                const bounds = loadedMap.layers[0].bounds;
                centerX = (bounds.min.x + bounds.max.x) / 2;
                centerY = (bounds.min.y + bounds.max.y) / 2;
              }

              if (centerScaleChangingHandler?.current) {
                centerScaleChangingHandler.current({
                  scale: np.scale ? np.scale : 10000,
                  centerx: centerX,
                  centery: centerY
                });
              }

              draw(_viewRef.current, loadedMap, np.scale ? np.scale : 10000, centerX, centerY, null);
            }
          });
        }
      }
      fetchData();
    }
    return () => { ignore = true; }
  }, [mapInfo, sessionID, formData, sessionManager, draw, dispatch, webServicesURL, root]);

  const _viewRef = useRef(null);
  const _div = useRef(null);

  const toFullViewport = () => {
    if (!mapData) return;

    const allVisibleBounds = mapData.layers.filter(l => l.visible).map(l => l.bounds);

    const minX = Math.min(...allVisibleBounds.map(b => b.min.x));
    const minY = Math.min(...allVisibleBounds.map(b => b.min.y));
    const maxX = Math.max(...allVisibleBounds.map(b => b.max.x));
    const maxY = Math.max(...allVisibleBounds.map(b => b.max.y));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = 1.2 * (maxX - minX) * pixelPerMeter() / _viewRef.current.clientWidth;
    const scaleY = 1.2 * (maxY - minY) * pixelPerMeter() / _viewRef.current.clientHeight;
    const scale = Math.max(scaleX, scaleY);

    updateCanvas({scale, centerx: centerX, centery: centerY});
  };

  useImperativeHandle(ref, () => ({
    mapInfo: () => mapInfo,
    mapData: () => mapData,
    centerScale: () => getCenterScale(),
    toFullViewport: () => {toFullViewport()},

    sublayers: () => mapData?.layers,
    selectedObject: () => selectedObject.current,
    control: () => _viewRef.current,

    setSelectedObject: (newSelected) => {setSelectedObject(newSelected)},
    setActiveLayer: (layer) => {dispatch(setFormRefs(formData.id + '_activeLayer', layer))},
    updateCanvas: (cs, context, redrawnHandler) => {updateCanvas(cs, context, redrawnHandler)},

    subscribeOnCenterScaleChanging: (changing) => {
      centerScaleChangingHandler.current = changing;
      changing(getCenterScale());
    },

    coords: () => {
      //const dotsPerMeter = _viewRef.current.width / (_viewRef.current.clientWidth / pixelPerMeter());
      const dotsPerMeter = pixelPerMeter();
      const centerScale = getCenterScale();
      return translator(
        centerScale.scale,
        { x: centerScale.centerx, y: centerScale.centery },
        dotsPerMeter,
        // { x: _viewRef.current.width / 2, y: _viewRef.current.height / 2 }
        { x: _viewRef.current.clientWidth / 2, y: _viewRef.current.clientHeight / 2 }
      );
    },
  }));

  useLayoutEffect(() => {
    dispatch(setFormRefs(formData.id + '_mapView', _viewRef))
  }, [formData, dispatch]);

  const divStyle = { width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'hidden' };
  const canvasStyle = { cursor: cursor ?? 'point', width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'hidden' };

  return (
    <div ref={_div} style={divStyle}>
      {mapInfo ? <canvas style={canvasStyle} ref={_viewRef}/> : <div>{t('map.notFound')}</div>}
    </div>
  );
}

export default Map = React.forwardRef(Map); // eslint-disable-line
