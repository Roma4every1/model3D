import { MapStage } from '../lib/map-stage';
import { mapEditConfig } from '../lib/constants';
import { signProvider } from '../drawer/sign-provider';
import { getTotalBounds } from '../lib/bounds';
import { showMapPropertyWindow } from '../store/map-window.actions';


export class ElementCreateModeProvider implements MapModeProvider {
  public readonly id = 'element-create';
  public readonly cursor = 'crosshair';
  public readonly blocked = true;

  constructor(private readonly formID: FormID) {}

  public onClick(e: MouseEvent, stage: MapStage): void {
    const layer = stage.getActiveLayer();
    if (!layer || !mapEditConfig[layer.elementType].canCreate) return;

    const point = stage.eventToPoint(e);
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);

    const newElement = getDefaultMapElement(layer.elementType, point);
    newElement.edited = true;
    layer.elements.push(newElement);
    layer.bounds = getTotalBounds([{bounds: layer.bounds}, {bounds: newElement.bounds}]);

    const data = stage.getMapData();
    const maxScale = layer.getMaxScale();

    if (data.scale > maxScale) {
      data.x = point.x;
      data.y = point.y;
      data.scale = maxScale;
    }
    stage.setActiveElement(newElement);

    if (newElement.type === 'polyline') {
      stage.setMode('line-append-point');
    } else {
      stage.setMode('default');
      showMapPropertyWindow(this.formID, newElement);
    }
    stage.render();
  }
}

function getDefaultMapElement(type: MapElementType, point: Point): MapElement {
  if (type === 'polyline') return getDefaultPolyline(point);
  if (type === 'sign') return getDefaultSign(point);
  if (type === 'label') return getDefaultLabel(point);
  if (type === 'pieslice') return getDefaultPieSlice(point);
}

function getDefaultSign({x, y}: Point): MapSign {
  return {
    type: 'sign', x, y, size: 1.3,
    color: signProvider.defaultColor, fontname: signProvider.defaultLib,
    symbolcode: 0, img: signProvider.defaultImage,
    bounds: {min: {x, y}, max: {x, y}},
  };
}

function getDefaultPolyline({x, y}: Point): MapPolyline {
  return {
    type: 'polyline', arcs: [{closed: false, path: [x, y]}],
    bordercolor: '#000000', borderwidth: 0.25, borderstyle: 0,
    fillbkcolor: '#ffffff', fillcolor: '#000000', transparent: true,
    attrTable: {}, bounds: {min: {x, y}, max: {x, y}},
  };
}

function getDefaultLabel({x, y}: Point): MapLabel {
  return {
    x, y, xoffset: 0, yoffset: 0, angle: 0,
    type: 'label', text: 'текст', color: '#000000',
    fontname: 'Arial', fontsize: 12,
    halignment: 0, valignment: 0,
    attrTable: {}, bounds: {min: {x, y}, max: {x, y}},
  };
}

function getDefaultPieSlice({x, y}: Point): MapPieSlice {
  return {
    type: 'pieslice', x: x, y: y, radius: 10,
    startangle: 0, endangle: 2 * Math.PI,
    color: '#222222', bordercolor: '#ffffff',
    fillname: undefined, fillbkcolor: '#dddddd', transparent: false,
    attrTable: {}, bounds: {min: {x, y}, max: {x, y}},
  };
}
