import { TFunction } from 'react-i18next';
import { distance } from '../../../lib/map-utils';
import { getBoundsByPoints } from '../../../lib/map-utils';


/** Линия со стандартными свойствами. */
function getDefaultPolyline(point: Point): MapPolyline {
  const path: [number, number] = [point.x, point.y];
  return {
    type: 'polyline',
    arcs: [{closed: false, path}],
    bounds: getBoundsByPoints([path]),
    borderstyle: 0,
    fillbkcolor: '#FFFFFF', fillcolor: '#000000',
    bordercolor: '#000000', borderwidth: 0.25,
    attrTable: {}, transparent: true,
  };
}

/** Подпись со стандартными свойствами. */
export function getDefaultLabel(point: Point, text: string): MapLabel {
  return {
    type: 'label', text, color: '#000000',
    fontname: 'Arial', fontsize: 12,
    halignment: 0, valignment: 0,
    xoffset: 0, yoffset: 0,
    x: point.x, y: point.y, angle: 0,
    attrTable: {},
  };
}

/** Точечный объект со стандартными свойствами. */
export function getDefaultSign(point: Point, img: HTMLImageElement, proto: SignImageProto): MapSign {
  return {
    type: 'sign',
    color: proto.color, fontname: proto.fontName,
    symbolcode: proto.symbolCode, img,
    size: 1.3, x: point.x, y: point.y,
  };
}

export function polylineByLegends(point: Point, legends: any, layerName: string): MapPolyline {
  const polyline = getDefaultPolyline(point);
  const sublayerSettings = legends?.sublayers?.find(sub => sub.name === layerName);
  if (!sublayerSettings) return polyline;

  let legendToSet = sublayerSettings.legends.find(l => l.default);
  if (!legendToSet && sublayerSettings.legends.length > 0) {
    legendToSet = sublayerSettings.legends[0];
  }
  if (!legendToSet) return polyline;

  switch (sublayerSettings.type) {
    case 'LabelModel':
      break;
    case 'PolylineModel':
      legendToSet.attrTable.forEach(p => {polyline.attrTable[p.name] = p.value});
      polyline.legend = legendToSet;
      legendToSet.properties.forEach(p => {
        switch (p.name) {
          case 'BorderStyle':
            polyline.borderstyle = Number(p.value.replace(',', '.'));
            break;
          case 'BorderStyleId':
            polyline.borderstyle = null;
            polyline.borderstyleid = p.value;
            break;
          case 'Closed':
            polyline.arcs[0].closed = (p.value === 'True');
            break;
          case 'FillBkColor':
            polyline.fillbkcolor = '#' + (p.value.slice(-6));
            break;
          case 'FillColor':
            polyline.fillcolor = '#' + (p.value.slice(-6));
            break;
          case 'FillName':
            polyline.fillname = p.value;
            break;
          case 'StrokeColor':
            polyline.bordercolor = '#' + (p.value.slice(-6));
            break;
          case 'StrokeThickness':
            polyline.borderwidth = Number(p.value.replace(',', '.'));
            break;
          case 'Transparency':
            polyline.transparent = (p.value !== 'Nontransparent');
            break;
          default: break;
        }
      });
      return polyline;
    default: break;
  }
}

/** Находит новый угол поворота элемента. */
export function getAngle(centerPoint: Point, currentPoint: Point): number {
  currentPoint.x -= centerPoint.x; currentPoint.y -= centerPoint.y;
  currentPoint.x /= distance(0, 0, currentPoint.x, currentPoint.y);
  return Math.sign(-currentPoint.y) * Math.acos(currentPoint.x) * 180 / Math.PI;
}

/* --- --- --- */

type SelectedType = 'polyline' | 'label' | 'sign' | 'field' | undefined;

export function getHeaderText(isCreating: boolean, type: SelectedType, layerName: string, t: TFunction): string {
  return isCreating ? getHeaderCreating(layerName) : getHeaderEditing(type, t);
}

function getHeaderEditing(selectedType: SelectedType, t: TFunction): string {
  const selectedTypeLabel = selectedType ? ` (тип: ${t('map.' + selectedType)})` : '';
  return `Редактирование${selectedTypeLabel}`;
}
function getHeaderCreating(layerName: string | undefined): string {
  return layerName
    ? `Создание элемента (подслой: ${layerName})`
    : 'Создание элемента';
}
