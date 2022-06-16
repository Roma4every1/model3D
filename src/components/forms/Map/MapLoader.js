import lines from "./lines.json";
import createMapsDrawer from "./maps/src/index.js";
import { URL } from "../../../utils"

const transform = require("./maps/src/gsTransform");

async function getHttpFun(address, encoding, sessionManager) {
  const done = await fetch(address, {credentials: 'include'});

  if (encoding === 'binary') {
    let buffer = await done.arrayBuffer();
    return new Uint8Array(buffer);
  } else if (encoding === 'json') {
    return await sessionManager.getJsonDataWithError(done);
  } else {
    return done.text();
  }
}

function parseStringToJson(parsedString) {
  if (typeof parsedString !== 'string') return parsedString;

  parsedString = transform.readXml(parsedString);

  Object.values(parsedString.layers).forEach(l => {
    l.elements = l.elements.map(el => {
      return { ...el, bounds: (el.bounds && el.bounds.length === 1) ? el.bounds[0] : el.bounds }
    });
  });
  return parsedString;
}

export function getMapLoader(sessionId, formId, owner, sessionManager) {
  const httpClient = {
    getHTTP: getHttpFun,
    getJSON: (url) => getHttpFun(url, 'json', sessionManager).then(parseStringToJson),
  };

  let loadMapURL = `getMap?sessionId=${sessionId}&formId=${formId}&mapId=`;
  let loadContainerURL = owner
    ? `getContainer?sessionId=${sessionId}&formId=${formId}&owner=${owner}&containerName=`
    : `getContainer?sessionId=${sessionId}&formId=${formId}&containerName=`;

  return createMapsDrawer({
    libs: window.location.pathname + 'libs/',
    symbolDef: window.location.pathname + 'libs/symbol.def',
    mapRoot: URL + loadMapURL,
    containerRoot: URL + loadContainerURL,
    imageRoot: '/images/',
    linesDef: window.location.pathname + 'libs/lines.def',
    drawOptions: {
      zoomSleep: 500,
      selectedSize: 6,
      selectedColor: '#000FFF',
      selectedWidth: 1,
      piesliceBorderColor: 'black',
      piesliceBorderWidth: 0.2,
      piesliceAlpha: 0.7,
    },
    linesConfig: { data: lines },
  }, httpClient);
}
