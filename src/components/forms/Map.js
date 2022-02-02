import React from 'react';
import { useSelector } from 'react-redux';
import { Resize } from 'on-el-resize';
import { getMapLoader } from './Map/MapLoader.js';
var utils = require("../../utils");
var pixelPerMeter = require("./Map/maps/src/pixelPerMeter");
var geom = require("./Map/maps/src/geom");

function Map(props, ref) {
    const { formData, data } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const [activeChannelName] = React.useState(data.activeChannels[0]);
    const [mapInfo, setMapInfo] = React.useState(null);
    const [mapData, setMapData] = React.useState(null);
    const [mapDrawnData, setMapDrawnData] = React.useState(null);

    const centerScaleChangingHandler = React.useRef(null);
    const drawer = React.useRef(null);
    const selectedObject = React.useRef(null);

    const getCenterScale = React.useCallback(() => ({
        scale: mapDrawnData.scale,
        centerx: Math.round(mapDrawnData.centerx),
        centery: Math.round(mapDrawnData.centery),
    }), [mapDrawnData]);

    const databaseData = useSelector((state) => state.channelsData[activeChannelName]);

    const getNearestNamedPoint = (point, scale, map) => {
        var SELECTION_RADIUS = 0.015;
        var minRadius;
        var nearestNp = null;
        map.points.forEach(p => {
            var localDist = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
            if (!minRadius || localDist < minRadius) {
                minRadius = localDist;
                if ((minRadius / scale) < SELECTION_RADIUS) {
                    nearestNp = p;
                }
            }
        });
        return nearestNp;
    };

    const draw = React.useCallback((canvas, map, scale, centerx, centery, selected, redrawnHandler) => {

        var mapDataD = drawer.current.showMap(canvas, map, {
            scale: scale,
            centerx: centerx,
            centery: centery,
            selected: selected
        })
            .on("update.begin", function (canvas, ret) {
                var context = {
                    center: { x: mapDataD.centerx, y: mapDataD.centery },
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
                if (!_viewRef.current.blocked) {
                    var nearestObject = getNearestNamedPoint(point, scale, map);
                    if (nearestObject) {
                        const newSelectedObject = nearestObject.UWID ? [nearestObject.UWID] : null;
                        selectedObject.current = newSelectedObject;
                        draw(canvas, map, mapDataD.scale, mapDataD.centerx, mapDataD.centery, newSelectedObject)
                        nearestObject.id = nearestObject.UWID;
                        nearestObject.selected = true;
                    }
                }
            });
        setMapDrawnData(mapDataD);
    }, []);

    const updateCanvas = React.useCallback((newcs, context, redrawnHandler) => {
        const cs = newcs ?? getCenterScale();
        mapData.layers[3].elements[3].selected = true;
        selectedObject.current = mapData.layers[3].elements[3];
        if (centerScaleChangingHandler?.current) {
            centerScaleChangingHandler.current(cs);
        }
        draw(context ?? _viewRef.current, mapData, cs.scale, cs.centerx, cs.centery, selectedObject?.current, redrawnHandler);
    }, [draw, mapData, getCenterScale]);

    React.useEffect(() => {
        if (databaseData?.data?.Rows && databaseData.data.Rows.length > 0) {
            if (databaseData.currentRowObjectName) {
                sessionManager.paramsManager.updateParamValue(utils.getParentFormId(formData.id), databaseData.currentRowObjectName, utils.tableRowToString(databaseData, databaseData.data.Rows[0])?.value, true);
            }
            setMapInfo(databaseData.data.Rows[0]);
        }
    }, [databaseData, formData, sessionManager]);

    React.useEffect(() => {
        let ignore = false;
        if (mapInfo) {
            async function fetchData() {
                const mapId = mapInfo.Cells[0];
                const owner = mapInfo.Cells[12];
                drawer.current = getMapLoader(sessionId, formData.id, owner);
                let loadedmap = await drawer.current.loadMap(String(mapId), { center: { x: 0, y: 0 }, scale: 10000 });
                if (!ignore) {
                    new drawer.current.Scroller(_viewRef.current);

                    setMapData(loadedmap);
                    var centerX = 0;
                    var centerY = 0;
                    draw(_viewRef.current, loadedmap, 10000, centerX, centerY, null);
                    loadedmap.pointsData.then(points => {
                        var np = points.find(function (it) { return it.debit }) || points[0];
                        if (np) {
                            centerX = np.x;
                            centerY = np.y;
                        }
                        else {
                            var bounds = loadedmap.layers[0].bounds;
                            centerX = (bounds.min.x + bounds.max.x) / 2;
                            centerY = (bounds.min.y + bounds.max.y) / 2;
                        }
                        draw(_viewRef.current, loadedmap, np.scale ? np.scale : 10000, centerX, centerY, null);
                    });
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [mapInfo, sessionId, formData, sessionManager, draw]);

    const _viewRef = React.useRef(null);
    const _div = React.useRef(null);

    const toFullViewport = () => {
        var bounds = mapData.layers[0].bounds;
        var centerX = (bounds.min.x + bounds.max.x) / 2;
        var centerY = (bounds.min.y + bounds.max.y) / 2;

        var newCenterPoint = {
            scale: getCenterScale().scale,
            centerx: centerX,
            centery: centerY
        };
        updateCanvas(newCenterPoint);
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
            var dotsPerMeter = _viewRef.current.width / (_viewRef.current.clientWidth / pixelPerMeter());
            var centerScale = getCenterScale();
            return geom.translator(centerScale.scale, { x: centerScale.centerx, y: centerScale.centery }, dotsPerMeter, { x: _viewRef.current.width / 2, y: _viewRef.current.height / 2 });
        },
        sublayers: () => {
            return mapData?.layers;
        },
        selectedObject: () => {
            return selectedObject.current;
        },
        control: () => {
            return _viewRef.current;
        }
    }));

    const [size, setSize] = React.useState({});

    const resizeHandler = () => {
        const { clientHeight, clientWidth } = _div.current || {};
        setSize({ clientHeight, clientWidth });
    };

    React.useEffect(() => {
        const resize = new Resize();
        let currentDiv = _div.current;
        resize.addResizeListener(currentDiv, resizeHandler);
        resizeHandler();
        return () => {
            if (currentDiv) {
                resize.removeResizeListener(currentDiv, resizeHandler);
            }
        };
    }, []);

    return (
        <div ref={_div} style={{ width: "100%", height: "100%" }}>
            <canvas
                ref={_viewRef}
                width={size.clientWidth}
                height={size.clientHeight}
            />
        </div>);
}
export default Map = React.forwardRef(Map); // eslint-disable-line