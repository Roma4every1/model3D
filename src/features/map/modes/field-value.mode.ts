import { MapStage } from '../lib/map-stage';
import { getInterpolatedFieldValue } from '../lib/selecting-utils';


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

  /** Состояние для просмотра. */
  public state: FieldValueState = {};
  /** Функция для обновления значений в окне. */
  public updateWindow: (() => void) | null = null;

  constructor(private readonly stage: MapStage) {}

  public onClick(e: MouseEvent): void {
    if (!this.updateWindow) return;
    this.setPoint(this.stage.eventToPoint(e));
    this.updateWindow();
  }

  public setPoint(point: Point): void {
    this.clear();
    this.state.point = point;

    this.stage.setExtraObject('field-value', point);
    this.stage.render();

    for (const layer of this.stage.getMapData().layers) {
      if (layer.elementType !== 'field' || !layer.visible) continue;
      for (const field of layer.elements as MapField[]) {
        const value = getInterpolatedFieldValue(field, point);
        if (value === null) continue;

        this.state.layer = layer;
        this.state.value = value;
        this.state.xNode = Math.floor((point.x - field.x) * (1 / field.stepx));
        this.state.yNode = Math.floor((Math.abs(field.y - point.y)) * (1 / field.stepy));
        return;
      }
    }
  }

  public clear(): void {
    this.state.point = undefined;
    this.state.layer = undefined;
    this.state.value = undefined;
    this.state.xNode = undefined;
    this.state.yNode = undefined;
  }
}
