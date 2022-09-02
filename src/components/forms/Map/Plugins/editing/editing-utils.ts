import { TFunction } from "react-i18next";
import { distance } from "../../map-utils";
import { getBoundsByPoints } from "../../map-utils";


/** Линия со стандартными свойствами. */
const getDefaultPolyline = (points: ClientPoint[]): MapPolyline => {
  const [p1, p2] = points;
  return {
    type: 'polyline',
    attrTable: {},
    arcs: [{closed: false, path: [p1.x, p1.y, p2.x, p2.y]}],
    bounds: getBoundsByPoints([[p1.x, p1.y], [p2.x, p2.y]]),
    borderstyle: 0,
    fillbkcolor: '#FFFFFF', fillcolor: '#000000',
    bordercolor: '#000000', borderwidth: 0.25,
    transparent: true,
  };
}

/** Подпись со стандартными свойствами. */
const getDefaultLabel = (point: ClientPoint, text: string): MapLabel => {
  return {
    type: 'label',
    text, color: '#000000',
    fontname: 'Arial', fontsize: 12,
    halignment: 1, valignment: 1,
    xoffset: 0, yoffset: 0,
    x: point.x, y: point.y, angle: 0,
    attrTable: {},
  };
}

export const createDefaultSign = (point: ClientPoint, img: HTMLImageElement, proto: SignImageProto): MapSign => {
  return {
    type: 'sign',
    color: proto.color, fontname: proto.fontName,
    symbolcode: proto.symbolCode, img,
    size: 2, x: point.x, y: point.y,
  };
}

const polylineByLegends = (points: ClientPoint[], legends: any, layerName: string): MapPolyline => {
  const polyline = getDefaultPolyline(points);
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

/** Создаёт элемент со стандартными свойствами по типу. */
export const createDefaultElement = (type: CreatingElementType, points: ClientPoint[], legends: any, layerName: string): MapElement => {
  if (type === 'label') return getDefaultLabel(points[0], 'текст');
  return polylineByLegends(points, legends, layerName);
}

/** Находит новый угол поворота элемента (по часовой стрелке).
 * @param c `center` — центр элемента
 * @param i `init point` — точка, где впервые была нажата мышь
 * @param p `current point` — текущая точка
 * */
export const getAngleDelta = (c: ClientPoint, i: ClientPoint, p: ClientPoint): number => {
  // векторы и их длины
  const ci = {x: i.x - c.x, y: i.y - c.y};
  const cp = {x: p.x - c.x, y: p.y - c.y};
  const ciLength = distance(0, 0, ci.x, ci.y);
  const cpLength = distance(0, 0, cp.x, cp.y);

  const scalarProduct = ci.x * cp.x + ci.y * cp.y;
  const pseudoScalarProduct = ci.x * cp.y - ci.y * cp.x;

  const cos = scalarProduct / (2 * ciLength * cpLength);
  return (pseudoScalarProduct > 0 ? -1 : 1) * Math.acos(cos);
}

/* --- --- --- */

type SelectedType = 'polyline' | 'label' | 'sign' | undefined;

const getHeaderEditing = (selectedType: SelectedType, t: TFunction): string => {
  const selectedTypeLabel = selectedType ? ` (тип: ${t('map.' + selectedType)})` : '';
  return `Редактирование${selectedTypeLabel}:`;
}
const getHeaderCreating = (layerName: string | undefined): string => {
  return layerName
    ? `Создание элемента (подслой: ${layerName}):`
    : 'Создание элемента:';
}

export const getHeaderText = (isCreating: boolean, type: SelectedType, layerName: string, t: TFunction): string => {
  return isCreating ? getHeaderCreating(layerName) : getHeaderEditing(type, t);
}
