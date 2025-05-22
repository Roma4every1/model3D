import type { FC } from 'react';
import type { PropertyWindowProps } from '../components/element-editors/properties-utils';
import { PolylinePropertyEditor } from '../components/element-editors/polyline';
import { SignPropertyEditor } from '../components/element-editors/sign';
import { LabelPropertyEditor } from '../components/element-editors/label';
import { PieSlicePropertyEditor } from '../components/element-editors/pieslice';
import { FieldPropertyEditor } from '../components/element-editors/field';


interface ElementEditConfig {
  canCreate: boolean;
  editModes: MapModeID[];
  propertyEditor: PropertyWindowConfig;
}
interface PropertyWindowConfig {
  component: FC<PropertyWindowProps>;
  windowSize: [number, number];
}

export const mapEditConfig: Record<MapElementType, ElementEditConfig> = {
  'polyline': {
    canCreate: true,
    editModes: [
      'default', 'line-move-point', 'line-append-point',
      'line-insert-point', 'line-remove-point',
    ],
    propertyEditor: {component: PolylinePropertyEditor, windowSize: [335, 212]},
  },
  'label': {
    canCreate: true,
    editModes: ['default', 'element-drag', 'element-rotate'],
    propertyEditor: {component: LabelPropertyEditor, windowSize: [350, 210]}
  },
  'sign': {
    canCreate: true,
    editModes: ['default', 'element-drag'],
    propertyEditor: {component: SignPropertyEditor, windowSize: [410, 186]}
  },
  'pieslice': {
    canCreate: true,
    editModes: ['default', 'element-drag'],
    propertyEditor: {component: PieSlicePropertyEditor, windowSize: [380, 175]},
  },
  'field': {
    canCreate: false,
    editModes: [],
    propertyEditor: {component: FieldPropertyEditor, windowSize: [320, 260]},
  },
  'image': {
    canCreate: false,
    editModes: [],
    propertyEditor: undefined,
  },
};

/** Количество пикселей в метре. В браузере `1cm = 96px / 2.54`. */
export const pixelPerMeter = 100 * 96 / 2.54;
