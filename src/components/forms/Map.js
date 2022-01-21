import React from 'react';
import { useSelector } from 'react-redux';
import { Resize } from 'on-el-resize';
import { getMapLoader } from './Map/MapLoader.js';
var utils = require("../../utils");

function Map(props, ref) {
    const { formData, data } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const [activeChannelName] = React.useState(data.activeChannels[0]);
    const [mapInfo, setMapInfo] = React.useState(null);
    const [mapData, setMapData] = React.useState(null);

    function centerScaleReducer(state, action) {
        switch (action.type) {
            case 'assign':
                return action.value;
            case 'assignCenter':
                return {
                    scale: state.scale,
                    centerx: action.value.centerx,
                    centery: action.value.centery
                };
            default:
                return state
        }
    }

    const [centerScale, dispatchCenterScale] = React.useReducer(centerScaleReducer, {
        scale: 100000,
        centerx: 0,
        centery: 0
    });

    const [mousedown, setmousedown] = React.useState(false);
    const [tempPoint, setTempPoint] = React.useState({});

    var drawer = React.useRef(null);

    const databaseData = useSelector((state) => state.channelsData[activeChannelName]);

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
                    var bounds = loadedmap.layers[0].bounds;
                    var centerX = (bounds.min.x + bounds.max.x) / 2;
                    var centerY = (bounds.min.y + bounds.max.y) / 2;

                    dispatchCenterScale({
                        type: 'assignCenter',
                        value: {
                            centerx: centerX,
                            centery: centerY
                        }
                    });
                    setMapData(loadedmap);

                    var mapDataD = drawer.current.showMap(_viewRef.current, loadedmap, {
                    })
                        .on("update.begin", function (canvas, ret) {
                            var context = {
                                center: { x: mapDataD.centerx, y: mapDataD.centery },
                                scale: mapDataD.scale
                            };
                            drawer.current.checkIndex(loadedmap, context);
                        })
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [mapInfo, sessionId, formData, sessionManager]);

    const updateCanvas = (cs) => {
        if (cs) {
            dispatchCenterScale({
                type: 'assign',
                value: cs
            });
            if (centerScaleChangingHandler.current) {
                centerScaleChangingHandler.current(cs);
            }
        }
        drawer.current.showMap(_viewRef.current, mapData, cs ?? centerScale);
    }

    const onMouseMove = (event) => {
        if (mousedown) {
            moveAt(event.pageX, event.pageY);
        }
    }

    const mouseDown = (event) => {
        setmousedown(true);
        setTempPoint({
            x: event.pageX,
            y: event.pageY
        });
    }

    const mouseUp = (event) => {
        setmousedown(false);
    }

    const moveAt = (pageX, pageY) => {
        var newCenterPoint = {
            scale: centerScale.scale,
            centerx: centerScale.centerx + (tempPoint.x - pageX) * centerScale.scale / 3870,
            centery: centerScale.centery + (tempPoint.y - pageY) * centerScale.scale / 3870
        };
        setTempPoint({
            x: pageX,
            y: pageY
        });
        updateCanvas(newCenterPoint);
    }

    const wheel = (e) => {
        var newScale = centerScale.scale + e.deltaY * centerScale.scale / 2000;
        var newCenterPoint = {
            scale: newScale,
            centerx: centerScale.centerx,
            centery: centerScale.centery
        };
        updateCanvas(newCenterPoint);
    }

    const _viewRef = React.useRef(null);
    const _div = React.useRef(null);
    const centerScaleChangingHandler = React.useRef(null);

    const toFullViewport = () => {
        var bounds = mapData.layers[0].bounds;
        var centerX = (bounds.min.x + bounds.max.x) / 2;
        var centerY = (bounds.min.y + bounds.max.y) / 2;

        var newCenterPoint = {
            scale: centerScale.scale,
            centerx: centerX,
            centery: centerY
        };
        updateCanvas(newCenterPoint);
    };

    React.useImperativeHandle(ref, () => ({
        toFullViewport: () => {
            toFullViewport();
        },
        updateCanvas: (cs) => {
            updateCanvas(cs);
        },
        subscribeOnCenterScaleChanging: (changing) => {
            centerScaleChangingHandler.current = changing;
            changing(centerScale);
        },
        sublayers: () => {
            return mapData?.layers;
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
            <canvas ref={_viewRef}
                width={size.clientWidth}
                height={size.clientHeight}
                onWheel={wheel}
                onMouseDown={mouseDown}
                onMouseUp={mouseUp}
                onMouseMove={onMouseMove}
            />
        </div>);
}
export default Map = React.forwardRef(Map); // eslint-disable-line