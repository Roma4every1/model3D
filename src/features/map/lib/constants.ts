import { NumberFormatOptions } from '@progress/kendo-react-intl';
import { PropertyWindowConfig } from '../components/edit-panel/properties-window/properties-utils';
import { SignProperties } from '../components/edit-panel/properties-window/sign/sign-properties';
import { PolylineProperties } from '../components/edit-panel/properties-window/polyline/polyline-properties';
import { LabelProperties } from '../components/edit-panel/properties-window/label/label-properties';
import { FieldProperties } from '../components/edit-panel/properties-window/field/field-properties';
import { PiesliceProperties } from '../components/edit-panel/properties-window/pieslice/pieslice-properties';



/** ### Режимы редактирования карты.
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
export const enum MapMode {
  AWAIT_POINT = 1,

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
  maximumFractionDigits: 0,
};

/** Доступные режимы редактирования для выбранных элементов карты. */
export const elementEditModes: Record<MapElementType, MapMode[]> = {
  polyline: [
    MapMode.MOVE_MAP, MapMode.MOVE_POINT,
    MapMode.ADD_END, MapMode.ADD_BETWEEN, MapMode.DELETE_POINT,
  ],
  label: [
    MapMode.MOVE_MAP, MapMode.MOVE, MapMode.ROTATE,
  ],
  sign: [
    MapMode.MOVE_MAP, MapMode.MOVE,
  ],
  field: [],
  pieslice:[
    MapMode.MOVE_MAP, MapMode.MOVE,
  ],
};

/** Типы элементов, которые можно создать. */
export const canCreateTypes: MapElementType[] = ['polyline', 'sign', 'label','pieslice'];

export const propertyWindowConfig: Record<MapElementType, PropertyWindowConfig> = {
  'sign': {
    component: SignProperties,
    windowSize: [410, 186],
  },
  'polyline': {
    component: PolylineProperties,
    windowSize: [335, 212],
  },
  'label': {
    component: LabelProperties,
    windowSize: [350, 210],
  },
  'field': {
    component: FieldProperties,
    windowSize: [320, 260],
  },
  'pieslice': {
    component: PiesliceProperties,
    windowSize: [400, 180],
  },
};
