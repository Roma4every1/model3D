import createMapsDrawer from './maps/src/index.js';
import lines from "./lines.json";
var utils = require("../../../utils");
var transform = require("./maps/src/gsTransform");

async function getHttpFun(address, encoding, sessionManager) {
    var done = await fetch(address,
        {
            credentials: 'include'
        });
    if (encoding === "binary") {
        let buffer = await done.arrayBuffer();
        return new Uint8Array(buffer);
    }
    else if (encoding === "json") {
        return await sessionManager.getJsonDataWithError(done);
    }
    else {
        return done.text();
    }
}

function parseStringToJson(parsedString) {
    if (typeof parsedString === "string") {
        parsedString = transform.readXml(parsedString);

        Object.values(parsedString.layers).forEach(l =>
        {
            l.elements = l.elements.map(el => {
                return { ...el, bounds: (el.bounds && el.bounds.length === 1) ? el.bounds[0] : el.bounds }
            });
        });
    }
    return parsedString;
}

export function getMapLoader(sessionId, formId, owner, sessionManager) {

    var httpClient = {

        "getHTTP": getHttpFun,

        "getJSON": function (url) {
            return getHttpFun(url, "json", sessionManager).then(parseStringToJson);
        }
    };

    let loadContainerURL;
    if (owner) {
        loadContainerURL = `getContainer?sessionId=${sessionId}&formId=${formId}&owner=${owner}&containerName=`;
    }
    else {
        loadContainerURL = `getContainer?sessionId=${sessionId}&formId=${formId}&containerName=`;
    }
    let loadMapURL = `getMap?sessionId=${sessionId}&formId=${formId}&mapId=`;

    var localDrawer = createMapsDrawer({
        libs: window.location.pathname + "libs/",
        symbolDef: window.location.pathname + "libs/symbol.def",
        mapRoot: utils.getServerUrl() + loadMapURL,
        containerRoot: utils.getServerUrl() + loadContainerURL,
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

    return localDrawer;
}