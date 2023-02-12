import { TFunction } from 'react-i18next';
import { distance } from '../../../lib/map-utils';
import { getBoundsByPoints } from '../../../lib/map-utils';


/** Линия со стандартными свойствами. */
const getDefaultPolyline = (point: ClientPoint): MapPolyline => {
  const path = [point.x, point.y];
  return {
    type: 'polyline',
    attrTable: {},
    arcs: [{closed: false, path}],
    bounds: getBoundsByPoints([path]),
    borderstyle: 0,
    fillbkcolor: '#FFFFFF', fillcolor: '#000000',
    bordercolor: '#000000', borderwidth: 0.25,
    transparent: true,
  };
}

/** Подпись со стандартными свойствами. */
export const getDefaultLabel = (point: ClientPoint, text: string): MapLabel => {
  return {
    type: 'label', text, color: '#000000',
    fontname: 'Arial', fontsize: 12,
    halignment: 0, valignment: 0,
    xoffset: 0, yoffset: 0,
    x: point.x, y: point.y, angle: 0,
    attrTable: {},
  };
}

export const getDefaultSign = (point: ClientPoint, img: HTMLImageElement, proto: SignImageProto): MapSign => {
  return {
    type: 'sign',
    color: proto.color, fontname: proto.fontName,
    symbolcode: proto.symbolCode, img,
    size: 2, x: point.x, y: point.y,
  };
}

export const polylineByLegends = (point: ClientPoint, legends: any, layerName: string): MapPolyline => {
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
export const getAngle = (centerPoint: ClientPoint, currentPoint: ClientPoint): number => {
  currentPoint.x -= centerPoint.x; currentPoint.y -= centerPoint.y;
  currentPoint.x /= distance(0, 0, currentPoint.x, currentPoint.y);
  return Math.sign(-currentPoint.y) * Math.acos(currentPoint.x) * 180 / Math.PI;
}

/* --- --- --- */

type SelectedType = 'polyline' | 'label' | 'sign' | undefined;

const getHeaderEditing = (selectedType: SelectedType, t: TFunction): string => {
  const selectedTypeLabel = selectedType ? ` (тип: ${t('map.' + selectedType)})` : '';
  return `Редактирование${selectedTypeLabel}`;
}
const getHeaderCreating = (layerName: string | undefined): string => {
  return layerName
    ? `Создание элемента (подслой: ${layerName})`
    : 'Создание элемента';
}

export const getHeaderText = (isCreating: boolean, type: SelectedType, layerName: string, t: TFunction): string => {
  return isCreating ? getHeaderCreating(layerName) : getHeaderEditing(type, t);
}
