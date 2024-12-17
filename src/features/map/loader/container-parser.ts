import { XMLParser } from 'fast-xml-parser';


export interface MapContainer {
  layers: Record<string, MapElement[]>;
  points?: MapPoint[];
}
type XMapElement<T = any> = Record<string, T>;


const parser = new XMLParser({
  ignoreDeclaration: true, ignorePiTags: true, ignoreAttributes: false,
  attributesGroupName: false, attributeNamePrefix: '',
  parseTagValue: false, parseAttributeValue: false,
});

export function parseMapContainer(input: string): MapContainer {
  const container: XMapElement = parser.parse(input).container;
  const l = container.sublayer;
  const p = container.namedpoints?.namedpoint;

  const layers: Record<string, MapElement[]> = {};
  let points: MapPoint[] = null;

  if (Array.isArray(l)) {
    for (const layer of l) layers[layer.uid] = createLayerElements(layer);
  } else if (l) {
    layers[l.uid] = createLayerElements(l);
  }
  if (Array.isArray(p)) {
    points = p.map(createMapPoint);
  } else if (p) {
    points = [createMapPoint(p)];
  }
  return {layers, points};
}

function createMapPoint(element: XMapElement): MapPoint {
  const { UWID, name, x, y, ...attrTable } = element;
  return {UWID: Number(UWID), name, x: Number(x), y: Number(y), attrTable};
}

function createLayerElements(element: XMapElement): MapElement[] {
  const { polyline, sign, label, pieslice, regular2dfield: field } = element;
  if (polyline) {
    return createElements(polyline, createPolyline);
  } else if (sign) {
    return createElements(sign, createSign);
  } else if (label) {
    return createElements(label, createLabel);
  } else if (pieslice) {
    return createElements(pieslice, createPieSlice);
  } else if (field) {
    return createElements(field, createField);
  } else {
    return [];
  }
}

function createElements(data: XMapElement[] | XMapElement, factory: any): MapElement[] {
  return Array.isArray(data) ? data.map(factory) : [factory(data)];
}

/* --- --- */

function createPolyline(element: XMapElement): MapPolyline {
  const {
    bordercolor, borderwidth, borderstyle, borderstyleid,
    fillname, fillcolor, fillbkcolor, transparent,
    bounds, arc, ...attrTable
  } = element;

  let arcs: PolylineArc[];
  if (Array.isArray(arc)) {
    arcs = arc.map(createPolylineArc);
  } else {
    arcs = [createPolylineArc(arc)];
  }

  return {
    type: 'polyline', bordercolor, borderwidth: Number(borderwidth),
    borderstyle: Number(borderstyle), borderstyleid, fillname, fillcolor, fillbkcolor,
    transparent: transparent !== '0', arcs, bounds: createPolylineBounds(bounds), attrTable,
  };
}

function createPolylineArc(element: XMapElement<string>): PolylineArc {
  const pathString = element.path;
  const path = pathString.match(/-?\d+(?:\.\d*)?/g).map(Number);

  for (let i = 2; i < path.length; ++i) {
    path[i] = path[i - 2] + path[i];
  }
  const closed = pathString.endsWith('Z') || pathString.endsWith('z');
  return {path, closed};
}

function createPolylineBounds(element: XMapElement<string>): Bounds {
  const left = Number(element.left);
  const right = Number(element.right);
  const top = Number(element.top);
  const bottom = Number(element.bottom);

  return {
    min: {x: left, y: Math.min(top, bottom)},
    max: {x: right, y: Math.max(top, bottom)},
  };
}

function createPieSlice(element: XMapElement<string>): MapPieSlice {
  const {
    x, y, color, bordercolor, radius, startangle, endangle,
    fillname, fillbkcolor, transparent, ...attrTable
  } = element;

  return {
    type: 'pieslice', x: Number(x), y: Number(y),
    radius: Number(radius), startangle: Number(startangle), endangle: Number(endangle),
    color, bordercolor: bordercolor ?? '#ffffff',
    fillname, fillbkcolor, transparent: transparent === undefined ? false : transparent !== '0',
    attrTable, bounds: null,
  };
}

function createSign(element: XMapElement<string>): MapSign {
  const { x, y, fontname, symbolcode, size, color, ...attrTable } = element;
  return {
    type: 'sign', x: Number(x), y: Number(y),
    fontname, symbolcode: Number(symbolcode),
    size: Number(size), color, img: undefined,
    attrTable, bounds: null,
  };
}

function createLabel(element: XMapElement<string>): MapLabel {
  const {
    x, y, xoffset, yoffset, angle, text, valignment, halignment,
    color, fillbkcolor, fontname, fontsize, transparent, bold, ...attrTable
  } = element;

  return {
    type: 'label', x: Number(x), y: Number(y),
    xoffset: xoffset !== undefined ? Number(xoffset) : 0,
    yoffset: yoffset !== undefined ? Number(yoffset) : 0,
    angle: angle !== undefined ? Number(angle) : 0,
    text, color, fontname, fontsize: Number(fontsize),
    valignment: Number(valignment) as MapLabelAlignment,
    halignment: Number(halignment) as MapLabelAlignment,
    fillbkcolor, transparent: transparent !== '0', bold: bold !== '0',
    attrTable, bounds: null,
  };
}

function createField(element: XMapElement): MapField {
  const { x, y, sizex, sizey, stepx, stepy, data, palette, ...attrTable } = element;

  palette.interpolated = palette.interpolated !== '0';
  for (const level of palette.level) level.value = Number(level.value);

  return {
    type: 'field', x: Number(x), y: Number(y),
    sizex: Number(sizex), sizey: Number(sizey),
    stepx: Number(stepx), stepy: Number(stepy),
    data, sourceRenderDataMatrix: undefined,
    palette, lastUsedPalette: undefined, deltasPalette: undefined,
    preCalculatedSpectre: undefined, attrTable, bounds: null,
  };
}
