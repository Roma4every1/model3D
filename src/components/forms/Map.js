import React from 'react';
import { useSelector } from 'react-redux';
import { Resize } from 'on-el-resize';
import createMapsDrawer from './Map/maps/src/index.js';
import lines from "./Map/lines.json";
var utils = require("../../utils");
var transform = require("./Map/maps/src/gsTransform");

function Map(props, ref) {
    const { formData, data } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const [activeChannelName] = React.useState(data.activeChannels[0]);
    const [mapId, setMapId] = React.useState(null);
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
            const id = databaseData.data.Rows[0].Cells[0];
            setMapId(id);
        }
    }, [databaseData, formData, sessionManager]);

    React.useEffect(() => {
        let ignore = false;
        if (mapId) {
            async function fetchData() {
                let data = await sessionManager.fetchData(`getMap?sessionId=${sessionId}&formId=${formData.id}&mapId=${mapId}`);
                if (!ignore) {
                    setMapData(data);
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [mapId, sessionId, formData, sessionManager]);

    React.useEffect(() => {
        let ignore = false;
        if (mapData) {

            async function fetchData() {
                if (!mapData.points) {
                    mapData.points = [];
                }
                const SERVER_URL = "http://web-dev:8080";

                function getHttpFun(address, encoding) {
                    return new Promise(function (resolve, reject) {
                        if (!address) {
                            return;
                        }
                        var xhr = new XMLHttpRequest();
                        xhr.responseType = "arraybuffer";
                        xhr.open("GET", address);
                        xhr.send();

                        xhr.onload = function () {
                            if (xhr.status === 304 && !(encoding === "binary")) {
                                return;
                            }
                            if (xhr.status === 200) {
                                if (xhr.response !== null) {
                                    return done(new Uint8Array(xhr.response), false);
                                }
                                fail("NULL");
                            }
                            if (xhr.status === 304)
                                return;
                            else
                                fail(xhr.status + " " + xhr.statusText);
                        };
                        xhr.ontimeout = function () {
                            return fail("TIMEOUT: " + address);
                        };
                        xhr.onerror = function (e) {
                            return fail(e || "ERROR");
                        };

                        function done(value, isCached) {
                            var headers = xhr.getAllResponseHeaders();
                            var jsonHeaders = headersToJson(headers);
                            if (jsonHeaders["Accept-Ranges"] === "bytes") {
                                value = Utf8ArrayToStr(DecompressArray(value));
                            }

                            resolve(value);
                        }

                        function fail(value) {
                            reject(value);
                        }

                    });
                }

                function headersToJson(source) {
                    var result = source.split("\r\n");
                    var resultJson = {};
                    result = result.splice(0, result.length - 1);
                    for (var i = result.length - 1; i >= 0; i--) {
                        var delimiter = result[i].indexOf(":");
                        var key = result[i].substring(0, delimiter);
                        var value = result[i].substring(delimiter + 2);
                        resultJson[key] = value;
                    }
                    return resultJson;
                }

                function parseHttpBytesToJson(array, headers) {
                    if (typeof array === "string") {
                        return JSON.parse(array/*.escapeSpecialChars()*/);
                    }
                    return JSON.parse(Utf8ArrayToStr(DecompressArray(new Uint8Array(array)))/*.escapeSpecialChars()*/);
                }

                function DecompressArray(bytes) {
                    var plain = bytes
                    try {
                        var infalte = bytes;
                        plain = infalte.decompress();
                    } catch (e) {

                    }
                    return plain;
                }

                function Utf8ArrayToStr(array) {
                    var out, i, len, c;
                    var char2, char3;

                    out = "";
                    len = array.length;
                    i = 0;
                    while (i < len) {
                        c = array[i++];
                        switch (c >> 4) {
                            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                                // 0xxxxxxx
                                out += String.fromCharCode(c);
                                break;
                            case 12: case 13:
                                // 110x xxxx   10xx xxxx
                                char2 = array[i++];
                                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                                break;
                            case 14:
                                // 1110 xxxx  10xx xxxx  10xx xxxx
                                char2 = array[i++];
                                char3 = array[i++];
                                out += String.fromCharCode(((c & 0x0F) << 12) |
                                    ((char2 & 0x3F) << 6) |
                                    ((char3 & 0x3F) << 0));
                                break;
                            default:
                                break;
                        }
                    }

                    return out;
                }

                var httpClient = {

                    "getHTTP": getHttpFun,

                    "getJSON": function (url) {
                        return getHttpFun(url).then(parseHttpBytesToJson);
                    }
                };

                var path = window.location.pathname;

                var localDrawer = createMapsDrawer({
                    libs: SERVER_URL + "/ij-srv/libs/",
                    symbolDef: SERVER_URL + "/ij-srv/libs/symbol.def",
                    mapRoot: SERVER_URL + "/ij-srv/data/map?id=",
                    containerRoot: SERVER_URL + "/ij-srv/data/map?container=",
                    imageRoot: "/images/",
                    linesDef: window.location.pathname + "libs/lines.def",

                    drawOptions: {
                        zoomSleep: 500,
                        selectedSize: 6,
                        selectedColor: "#000FFF",
                        selectedWidth: 1,
                        piesliceBorderColor: "black",
                        piesliceBorderWidth: 0.2,
                        piesliceAlpha: 0.7,
                    },

                    linesConfig: { data: lines }
                }, httpClient);
                drawer.current = localDrawer;

                await Promise.all(mapData.layers.map(async l => {
                    if (typeof l.visible === "string") {
                        l.visible = (l.visible !== '0');
                    }
                    let data;
                    if (mapData.owner) {
                        data = await sessionManager.fetchData(`getContainer?sessionId=${sessionId}&formId=${formData.id}&containerName=${l.container}&owner=${mapData.owner}`);
                    }
                    else {
                        data = await sessionManager.fetchData(`getContainer?sessionId=${sessionId}&formId=${formData.id}&containerName=${l.container}`);
                    }
                    var loadedmap = transform.readXml(data);
                    if (loadedmap) {
                        l.elements = loadedmap.layers[l.uid].elements.map(el => {
                            return { ...el, bounds: (el.bounds && el.bounds.length === 1) ? el.bounds[0] : el.bounds }
                        });
                        l.bounds = { min: { x: l.bounds.left, y: l.bounds.bottom }, max: { x: l.bounds.right, y: l.bounds.top } };
                        mapData.points = [...mapData.points, l.namedpoints]
                    }
                }));

                if (!ignore) {
                    var bounds = mapData.layers[0].bounds;
                    var centerX = (bounds.min.x + bounds.max.x) / 2;
                    var centerY = (bounds.min.y + bounds.max.y) / 2;

                    dispatchCenterScale({
                        type: 'assignCenter',
                        value: {
                            centerx: centerX,
                            centery: centerY
                        }
                    });

                    mapData.mapErrors = [];

                    var mapDataD = drawer.current.showMap(_viewRef.current, mapData, {
                    })
                        .on("update.begin", function (canvas, ret) {
                            var context = {
                                center: { x: mapDataD.centerx, y: mapDataD.centery },
                                scale: mapDataD.scale
                            };
                            drawer.current.checkIndex(mapData, context);
                        })
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [mapData, formData, sessionId, sessionManager]);

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