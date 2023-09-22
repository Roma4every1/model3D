import { TFunction } from 'react-i18next';
import { distance } from '../../../lib/map-utils';
import { getBoundsByPoints } from '../../../lib/map-utils';
import { provider } from '../../../drawer';


export function getDefaultMapElement(type: MapElementType, point: Point): MapElement {
  if (type === 'sign') return getDefaultSign(point);
  if (type === 'label') return getDefaultLabel(point);
  return getDefaultPolyline(point);
}

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
function getDefaultLabel(point: Point): MapLabel {
  return {
    type: 'label', text: 'текст', color: '#000000',
    fontname: 'Arial', fontsize: 12,
    halignment: 0, valignment: 0,
    xoffset: 0, yoffset: 0,
    x: point.x, y: point.y, angle: 0,
    attrTable: {},
  };
}

/** Точечный объект со стандартными свойствами. */
function getDefaultSign(point: Point): MapSign {
  return {
    type: 'sign',
    color: provider.defaultSignColor, fontname: provider.defaultSignLib,
    symbolcode: 0, img: provider.defaultSignImage,
    size: 1.3, x: point.x, y: point.y,
  };
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
