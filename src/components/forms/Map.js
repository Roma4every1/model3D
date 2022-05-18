import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getMapLoader } from './Map/MapLoader.js';
import setFormRefs from '../../store/actionCreators/setFormRefs';

const utils = require("../../utils");
const pixelPerMeter = require("./Map/maps/src/pixelPerMeter");
const geom = require("./Map/maps/src/geom");


// http://gs-wp51:81/ReactWMW/?systemName=PREPARE_SYSTEM - исходное поведение
// Баяндыское -> D3fm -> 28 -> Карта изобар -> 31.12.2019

function Map(props, ref) {
    const { formData, data } = props;
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const cursor = useSelector((state) => state.formRefs[formData.id + "_cursor"]);
    const [activeChannelName] = React.useState(data.activeChannels[0]);
    const [mapInfo, setMapInfo] = React.useState(null);
    const [mapData, setMapData] = React.useState(null);
    const [mapDrawnData, setMapDrawnData] = React.useState(null);

    const centerScaleChangingHandler = React.useRef(null);
    const drawer = React.useRef(null);
    const selectedObject = React.useRef(null);
    const setSelectedObject = React.useCallback((newSelected) => {
        selectedObject.current = newSelected;
        dispatch(setFormRefs(formData.id + "_selectedObject", newSelected));
    }, [dispatch, formData.id]);

    const getCenterScale = React.useCallback(() => ({
        scale: mapDrawnData?.scale ?? 10000,
        centerx: Math.round(mapDrawnData?.centerx ?? 0),
        centery: Math.round(mapDrawnData?.centery ?? 0),
    }), [mapDrawnData]);

    const databaseData = useSelector((state) => state.channelsData[activeChannelName]);

    const getNearestNamedPoint = (point, scale, map) => {
        const SELECTION_RADIUS = 0.015;
        let minRadius, nearestNp = null;

        map.points.forEach((p) => {
          const localDist = geom.distance(p.x, p.y, point.x, point.y);
          if (!minRadius || localDist < minRadius) {
            minRadius = localDist;
            if ((minRadius / scale) < SELECTION_RADIUS) nearestNp = p;
          }
        });
        return nearestNp;
    };

    const draw = React.useCallback((canvas, map, scale, centerX, centerY, selected, redrawnHandler) => {
        const mapDataD = drawer.current.showMap(canvas, map, {
            scale: scale,
            centerx: centerX,
            centery: centerY,
            selected: selected
        })
          .on("update.begin", function (canvas, ret) {
              const context = {
                  center: {x: mapDataD.centerx, y: mapDataD.centery},
                  scale: mapDataD.scale,
              };
              drawer.current.checkIndex(map, context);
          })
          .on("update.end", function (canvas) {
              if (redrawnHandler) {
                  redrawnHandler(canvas);
              }
          })
          .on("pointPicked", function (point, scale) {
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
        if (drawer.current) {
        }
        setMapDrawnData(mapDataD);
    }, [setSelectedObject]);

    const updateCanvas = React.useCallback((newcs, context, redrawnHandler) => {
        const cs = newcs ?? getCenterScale();
        if (centerScaleChangingHandler?.current) {
            centerScaleChangingHandler.current(cs);
        }
        mapDrawnData.emit("detach");
        draw(context ?? _viewRef.current, mapData, cs.scale, cs.centerx, cs.centery, selectedObject?.current, redrawnHandler);
    }, [draw, mapData, getCenterScale, mapDrawnData]);

    React.useEffect(() => {
        if (databaseData?.data?.Rows && databaseData.data.Rows.length > 0) {
            if (databaseData.currentRowObjectName) {
                sessionManager.paramsManager.updateParamValue(utils.getParentFormId(formData.id), databaseData.currentRowObjectName, utils.tableRowToString(databaseData, databaseData.data.Rows[0])?.value, true);
            }
            setMapInfo(databaseData.data.Rows[0]);
        }
        else {
            setMapInfo(null);
        }
    }, [databaseData, formData, sessionManager]);

    React.useEffect(() => {
        let ignore = false;
        dispatch(setFormRefs(formData.id + "_activeLayer", null));
        if (mapInfo) {
            async function fetchData() {
                const mapId = mapInfo.Cells[0];
                const owner = mapInfo.Cells[12];
                drawer.current = getMapLoader(sessionId, formData.id, owner, sessionManager);
                let loadedMap = await drawer.current.loadMap(String(mapId), { center: { x: 0, y: 0 }, scale: 10000 });
                if (!ignore) {
                    new drawer.current.Scroller(_viewRef.current);
                    _viewRef.current.blocked = false;
                    dispatch(setFormRefs(formData.id + "_mapData", null));
                    dispatch(setFormRefs(formData.id + "_mapData", loadedMap));
                    dispatch(setFormRefs(formData.id + "_selectedObjectEditing", false));
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
                            }
                            else {
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
    }, [mapInfo, sessionId, formData, sessionManager, draw, dispatch]);

    const _viewRef = React.useRef(null);
    const _div = React.useRef(null);

    const toFullViewport = () => {
        if (mapData) {
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

            const newCenterPoint = {
                scale: scale,
                centerx: centerX,
                centery: centerY
            };
            updateCanvas(newCenterPoint);
        }
    };

    React.useImperativeHandle(ref, () => ({
        toFullViewport: () => {
            toFullViewport();
        },
        updateCanvas: (cs, context, redrawnHandler) => {
            updateCanvas(cs, context, redrawnHandler);
        },
        subscribeOnCenterScaleChanging: (changing) => {
            centerScaleChangingHandler.current = changing;
            changing(getCenterScale());
        },
        mapInfo: () => {
            return mapInfo;
        },
        mapData: () => {
            return mapData;
        },
        centerScale: () => {
            return getCenterScale();
        },
        coords: () => {
            const dotsPerMeter = _viewRef.current.width / (_viewRef.current.clientWidth / pixelPerMeter());
            const centerScale = getCenterScale();
            return geom.translator(centerScale.scale, { x: centerScale.centerx, y: centerScale.centery }, dotsPerMeter, { x: _viewRef.current.width / 2, y: _viewRef.current.height / 2 });
        },
        sublayers: () => {
            return mapData?.layers;
        },
        selectedObject: () => {
            return selectedObject.current;
        },
        setSelectedObject: (newSelected) => {
            setSelectedObject(newSelected);
        },
        control: () => {
            return _viewRef.current;
        },
        setActiveLayer: (layer) => {
            dispatch(setFormRefs(formData.id + "_activeLayer", layer));
        }
    }));

    React.useLayoutEffect(() => {
        dispatch(setFormRefs(formData.id + "_mapView", _viewRef))
    }, [formData, dispatch]);

    const divStyle = { width: "100%", height: "100%", "overflowY": "hidden", "overflowX": "hidden" };
    const canvasStyle = { cursor: cursor ?? "point", width: "100%", height: "100%", "overflowY": "hidden", "overflowX": "hidden" };
    return (
      <div ref={_div} style={divStyle}>
        {mapInfo ? <canvas style={canvasStyle} ref={_viewRef}/> : <div>{t("map.notFound")}</div>}
      </div>
    );
}
export default Map = React.forwardRef(Map); // eslint-disable-line
