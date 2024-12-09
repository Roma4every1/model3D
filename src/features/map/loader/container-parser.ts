import { XMLParser } from 'fast-xml-parser';


export interface MapContainer {
  layers: Record<string, MapElement[]>;
  points?: MapPoint[];
}
type XElement<T = any> = Record<string, T>;


const parser = new XMLParser({
  ignoreDeclaration: true, ignorePiTags: true, ignoreAttributes: false,
  attributesGroupName: false, attributeNamePrefix: '',
  parseTagValue: false, parseAttributeValue: false,
});

export function parseMapContainer(input: string): MapContainer {
  const container: XElement = parser.parse(input).container;
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

function createMapPoint(element: XElement): MapPoint {
  const { UWID, name, x, y, ...attrTable } = element;
  return {UWID: Number(UWID), name, x: Number(x), y: Number(y), attrTable};
}

function createLayerElements(element: XElement): MapElement[] {
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

function createElements(data: XElement[] | XElement, factory: any): MapElement[] {
  return Array.isArray(data) ? data.map(factory) : [factory(data)];
}

/* --- --- */

function createPolyline(element: XElement): MapPolyline {
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

function createPolylineArc(element: XElement<string>): PolylineArc {
  const pathString = element.path;
  const path = pathString.match(/-?\d+(?:\.\d*)?/g).map(Number);

  for (let i = 2; i < path.length; ++i) {
    path[i] = path[i - 2] + path[i];
  }
  const closed = pathString.endsWith('Z') || pathString.endsWith('z');
  return {path, closed};
}

function createPolylineBounds(element: XElement<string>): Bounds {
  const x1 = Number(element.left);
  const x2 = Number(element.right);
  const y1 = Number(element.top);
  const y2 = Number(element.bottom);

  return {
    min: {x: Math.min(x1, x2), y: Math.min(y1, y2)},
    max: {x: Math.max(x1, x2), y: Math.max(y1, y2)},
  };
}

function createPieSlice(element: XElement<string>): MapPieSlice {
  const { x, y, color, bordercolor, radius, startangle, endangle, fillname, fillbkcolor,
    ...attrTable } = element;
  return {
    type: 'pieslice', x: Number(x), y: Number(y),
    radius: Number(radius), startangle: Number(startangle), endangle: Number(endangle),
    color, bordercolor, fillname, fillbkcolor, attrTable,
  };
}

function createSign(element: XElement<string>): MapSign {
  const { x, y, fontname, symbolcode, size, color, ...attrTable } = element;
  return {
    type: 'sign', x: Number(x), y: Number(y),
    fontname, symbolcode: Number(symbolcode),
    size: Number(size), color, img: undefined, attrTable,
  };
}

function createLabel(element: XElement<string>): MapLabel {
  const {
    x, y, xoffset, yoffset, angle, text, valignment, halignment,
    color, fillbkcolor, fontname, fontsize, transparent, bold, ...attrTable
  } = element;

  return {
    type: 'label', x: Number(x), y: Number(y),
    xoffset: Number(xoffset), yoffset: Number(yoffset), angle: Number(angle), text,
    valignment: Number(valignment) as MapLabelAlignment,
    halignment: Number(halignment) as MapLabelAlignment,
    color, fillbkcolor, fontname, fontsize: Number(fontsize),
    transparent: transparent !== '0', bold: bold !== '0', attrTable,
  };
}

function createField(element: XElement): MapField {
  const { x, y, sizex, sizey, stepx, stepy, data, palette, ...attrTable } = element;

  palette.interpolated = palette.interpolated !== '0';
  for (const level of palette.level) level.value = Number(level.value);

  return {
    type: 'field', x: Number(x), y: Number(y),
    sizex: Number(sizex), sizey: Number(sizey),
    stepx: Number(stepx), stepy: Number(stepy),
    data, sourceRenderDataMatrix: undefined,
    palette, lastUsedPalette: undefined, deltasPalette: undefined,
    preCalculatedSpectre: undefined, attrTable,
  };
}
