import React from 'react';
import createMapsDrawer from './maps/src/index.js';
var _ = require("lodash");
var transform = require("./maps/src/gsTransform");

class App extends React.Component {
    componentDidMount() {
        this.updateCanvas();
    }

    constructor(props) {
        super(props)
        this.scale = 2000;
        this.x = 0;
        this.y = 0;
        this.mousedown = false;

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

        this.httpClient = {

            "getHTTP": getHttpFun,

            "getJSON": function (url) {
                return getHttpFun(url).then(parseHttpBytesToJson);
            }
        };

        this.httpClient.getJSON("http://web-dev:8080/ij-srv/resources/lines.json").then(res => {
            this.drawer = createMapsDrawer({
                libs: SERVER_URL + "/ij-srv/libs/",
                symbolDef: SERVER_URL + "/ij-srv/libs/symbol.def",
                mapRoot: SERVER_URL + "/ij-srv/data/map?id=",
                containerRoot: SERVER_URL + "/ij-srv/data/map?container=",
                imageRoot: "/images/",
                linesDef: SERVER_URL + "/ij-srv/libs/lines.def",

                drawOptions: {
                    zoomSleep: 500,
                    selectedSize: 6,
                    selectedColor: "#000FFF",
                    selectedWidth: 1,
                    piesliceBorderColor: "black",
                    piesliceBorderWidth: 0.2,
                    piesliceAlpha: 0.7,
                },

                linesConfig: { data: res }
            },
                this.httpClient);
            //this.updateCanvas();
        });
    }

    onMouseMove(event) {
        if (this.mousedown) {
            this.moveAt(event.pageX, event.pageY);
        }
    }

    mouseDown(event) {
        this.mousedown = true;
        this.tempx = event.pageX;
        this.tempy = event.pageY;
    }

    mouseUp(event) {
        this.mousedown = false;
    }

    moveAt(pageX, pageY) {
        this.x = this.x + (this.tempx - pageX) * this.scale / 3870;
        this.y = this.y + (this.tempy - pageY) * this.scale / 3870;
        this.tempx = pageX;
        this.tempy = pageY;
        this.updateCanvas();
    }

    wheel(e) {
        this.scale = this.scale + e.deltaY;
        this.updateCanvas();
    }

    handleChangeFile(event) {
        const file = event.target.files[0];

        let reader = new FileReader();
        reader.readAsText(file);

        reader.app = this;

        reader.onload = function () {
            console.log(reader.result);
            var loadedmap = transform.readXml(reader.result);
            loadedmap.mapErrors = [];
            var prebounds = Object.values(loadedmap.layers)[0];
            var element = prebounds.elements[0];
            var bounds = element.bounds;

            var localx = element.x;
            var localy = element.y;

            if (bounds) {
                localx = (bounds[0].min.x + bounds[0].max.x) / 2;
                localy = (bounds[0].min.y + bounds[0].max.y) / 2;
            }

            loadedmap.points = [{ text: "testttt", x: localx, y: localy, fontsize: 16, fontname: "Arial", color: "black", angle: 45 }];
            loadedmap.arraylayers = [];
            _.map(loadedmap.layers, (layer) => {
                layer.visible = true;
                layer.bounds = { min: { x: localx - 5000, y: localy - 5000 }, max: { x: localx + 5000, y: localy + 5000 } };
                loadedmap.arraylayers.push(layer);
            });
            loadedmap.layers = loadedmap.arraylayers;

            reader.app.x = localx;
            reader.app.y = localy;
            reader.app.loadedmap = loadedmap;

            reader.app.drawer.showMap(reader.app.refs.canvas, loadedmap, {
                scale: reader.app.scale,
                centerx: reader.app.x,
                centery: reader.app.y
            })
        };
    }

    updateCanvas() {

        var mymap = {
            layers: [{
                name: "Layer1Test", visible: true, elements: [{ type: "pieslice", x: 220, y: 210, radius: 15, color: "green", startangle: 130 / 180 * Math.PI, endangle: 10 / 180 * Math.PI },
                { type: "pieslice", x: 220, y: 210, radius: 10, color: "yellow", startangle: 40 / 180 * Math.PI, endangle: 130 / 180 * Math.PI }],
                bounds: { min: { x: -200, y: -200 }, max: { x: 200, y: 200 } }
            },
            {
                name: "Layer2Test", visible: true, elements: [{ type: "polyline", arcs: [{ path: [120, 110, 120, 10, 20, 10] }], borderstyle: 4, bordercolor: "brown", borderwidth: 4, transparent: true }],
                bounds: { min: { x: -200, y: -200 }, max: { x: 200, y: 200 } }
            }
            ],
            mapErrors: [],
            points: [{ text: "testttt", x: 120, y: 110, fontsize: 16, fontname: "Arial", color: "black", angle: 45 }]
        };

        if (this.loadedmap) {
            mymap = this.loadedmap;
        }
        if (this.drawer) {
            this.drawer.showMap(this.refs.canvas, mymap, {
                scale: this.scale,
                centerx: this.x,
                centery: this.y
            })
        }
    }

    render() {
        return (
            <div>
                <input type="file" onChange={this.handleChangeFile.bind(this)} />
                <canvas ref="canvas" width={900} height={500} onWheel={(e) => this.wheel(e)} onMouseDown={(e) => this.mouseDown(e)} onMouseUp={(e) => this.mouseUp(e)} onMouseMove={(e) => this.onMouseMove(e)} />
            </div>
        );
    }
}

export default App;