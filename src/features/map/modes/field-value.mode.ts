import { round } from 'shared/lib';
import { getGlobalVariable } from 'shared/global';
import { MapStage } from '../lib/map-stage';
import { getInterpolatedFieldValue } from '../lib/selecting-utils';


/** Глобальный контекст окна просмотра значения поля в точке. */
export interface FieldValueContext {
  /** Сцена активной карты. */
  stage: MapStage;
  /** Состояние для последней точки. */
  state: FieldValueState;
  /** Функция для вызова рендера окна. */
  updateWindow?: () => void;
}

/** Состояние для просмотра значения поля в точке. */
export interface FieldValueState {
  /** Координаты точки на карте. */
  point?: Point;
  /** Слой с полем, с которого снято значение. */
  layer?: IMapLayer;
  /** Значение поля. */
  value?: number;
  /** Узел поля по X. */
  xNode?: number;
  /** Узел поля по Y. */
  yNode?: number;
}

/** Режим карты для просмотра значения поля в точке. */
export class FieldValueModeProvider implements MapModeProvider {
  public readonly id = 'show-field-value';
  public readonly cursor = 'crosshair';
  public readonly blocked = false;

  constructor(private readonly stage: MapStage) {}

  public onClick(e: MouseEvent): void {
    const context = getGlobalVariable<FieldValueContext>('fv');
    if (!context) return;
    this.setPoint(this.stage.eventToPoint(e), context);
    context.updateWindow();
  }

  public setPoint(point: Point, context: FieldValueContext): void {
    const state: FieldValueState = {point};
    context.state = state;

    this.stage.setExtraObject('field-value', point);
    this.stage.render();
    const layers = this.stage.getMapData().layers;

    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];
      if (layer.elementType !== 'field' || !layer.visible) continue;

      for (const field of layer.elements as MapField[]) {
        const value = getInterpolatedFieldValue(field, point);
        if (value === null) continue;

        state.layer = layer;
        state.value = value;
        state.xNode = round((point.x - field.x) * (1 / field.stepx), 1);
        state.yNode = round((Math.abs(field.y - point.y)) * (1 / field.stepy), 1);
        return;
      }
    }
  }
}
