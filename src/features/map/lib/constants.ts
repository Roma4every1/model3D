import { NumberFormatOptions } from '@progress/kendo-react-intl';
import { PropertyWindowConfig } from '../components/edit-panel/properties-window/properties-utils';
import { SignProperties } from '../components/edit-panel/properties-window/sign/sign-properties';
import { PolylineProperties } from '../components/edit-panel/properties-window/polyline/polyline-properties';
import { LabelProperties } from '../components/edit-panel/properties-window/label/label-properties';
import { FieldProperties } from '../components/edit-panel/properties-window/field/field-properties';


/** ### Режимы редактирования карты.
 * **Общие режимы**:
 * + `NONE` — "ничего"
 * + `SELECTING` — режим выбора элемента
 * + `CREATING` — режим создания элемента
 * + `AWAIT_POINT` — ожидание точки нового элемента
 *
 * **Режимы редактирования элемента**:
 * + `MOVE_MAP` — двигать карту
 * + `MOVE` — переместить элемент
 * + `ROTATE` — повернуть элемент
 *
 * **Режимы редактирования линии/области**:
 * + `MOVE_POINT` — переместить точку
 * + `ADD_END` — добавить точку в конец
 * + `ADD_BETWEEN` — добавить точку
 * + `DELETE_POINT` — удалить точку
 * */
export enum MapMode {
  NONE = -1,
  SELECTING = 0,
  CREATING = 1,
  AWAIT_POINT = 2,

  MOVE_MAP = 10,
  MOVE = 11,
  ROTATE = 12,

  MOVE_POINT = 21,
  ADD_END = 22,
  ADD_BETWEEN = 23,
  DELETE_POINT = 24,
}


/** Формат координат для числовых редакторов в рамках карт. */
export const coordinateFormat: NumberFormatOptions = {
  style: 'decimal',
  useGrouping: false,
  maximumFractionDigits: 1,
};

export const propertyWindowConfig: Record<MapElementType, PropertyWindowConfig> = {
  'sign': {
    component: SignProperties,
    windowSize: [410, 186],
  },
  'polyline': {
    component: PolylineProperties,
    windowSize: [335, 235],
  },
  'label': {
    component: LabelProperties,
    windowSize: [350, 210],
  },
  'field': {
    component: FieldProperties,
    windowSize: [320, 260],
  },
};
