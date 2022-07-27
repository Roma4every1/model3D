import lines from "./lines.json";
import createMapsDrawer from "./maps/src/index.js";
import { readXml } from "./maps/src/gsTransform";

import symbolDef from "../../../static/libs/symbol.def";


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

const parseStringToJson = (parsedString) => {
  if (typeof parsedString !== 'string') return parsedString;
  parsedString = readXml(parsedString);

  Object.values(parsedString.layers).forEach(layer => {
    layer.elements = layer.elements.map(el => {
      return { ...el, bounds: (el.bounds && el.bounds.length === 1) ? el.bounds[0] : el.bounds }
    });
  });
  return parsedString;
}

export function getMapLoader(sessionID, formID, owner, sessionManager, webServicesURL, root) {
  const httpClient = {
    getHTTP: getHttpFun,
    getJSON: (url) => getHttpFun(url, 'json', sessionManager).then(parseStringToJson),
  };

  const loadMapURL = `getMap?sessionId=${sessionID}&formId=${formID}&mapId=`;
  const loadContainerURL = owner
    ? `getContainer?sessionId=${sessionID}&formId=${formID}&owner=${owner}&containerName=`
    : `getContainer?sessionId=${sessionID}&formId=${formID}&containerName=`;

  return createMapsDrawer({
    libs: root + 'libs/',
    symbolDef: symbolDef,
    linesDef: root + 'libs/lines.def',
    imageRoot: root + 'images/',
    mapRoot: webServicesURL + loadMapURL,
    containerRoot: webServicesURL + loadContainerURL,
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
