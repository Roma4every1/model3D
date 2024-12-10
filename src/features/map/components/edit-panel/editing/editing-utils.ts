import { TFunction } from 'react-i18next';
import { signProvider } from '../../../drawer/sign-provider';


export function getDefaultMapElement(type: MapElementType, point: Point): MapElement {
  if (type === 'sign') return getDefaultSign(point);
  if (type === 'label') return getDefaultLabel(point);
  if (type === 'pieslice') return getDefaultPieSlice(point);
  return getDefaultPolyline(point);
}

/** Точечный объект со стандартными свойствами. */
function getDefaultSign(point: Point): MapSign {
  return {
    type: 'sign',
    color: signProvider.defaultColor, fontname: signProvider.defaultLib,
    symbolcode: 0, img: signProvider.defaultImage,
    size: 1.3, x: point.x, y: point.y,
  };
}

/** Линия со стандартными свойствами. */
function getDefaultPolyline(point: Point): MapPolyline {
  return {
    type: 'polyline',
    arcs: [{closed: false, path: [point.x, point.y]}],
    bounds: {min: point, max: point},
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

function getDefaultPieSlice(point: Point): MapPieSlice {
  return {
    type: 'pieslice', color: 'red', bordercolor: 'white',
    x: point.x, y: point.y, startangle: 0, endangle: 2 * Math.PI, radius:10,
    fillbkcolor: 'green',
    attrTable: {},
  };
}
/* --- --- --- */

export function getHeaderText(isCreating: boolean, type: MapElementType, layerName: string, t: TFunction): string {
  return isCreating ? getHeaderCreating(layerName) : getHeaderEditing(type, t);
}

function getHeaderEditing(selectedType: MapElementType, t: TFunction): string {
  const selectedTypeLabel = selectedType ? ` (тип: ${t('map.' + selectedType)})` : '';
  return `Редактирование${selectedTypeLabel}`;
}
function getHeaderCreating(layerName: string | undefined): string {
  return layerName
    ? `Создание элемента (подслой: ${layerName})`
    : 'Создание элемента';
}
