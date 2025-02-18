import { MapStage } from '../lib/map-stage';
import { getInterpolatedFieldValue } from '../lib/selecting-utils';


/** Состояние для просмотра значения поля в точке. */
export interface FieldValueState {
  /** Координаты точки на карте. */
  point?: Point;
  /** Узел поля по X. */
  xNode?: number;
  /** Узел поля по Y. */
  yNode?: number;
  /** Значение поля. */
  value?: number;
}

/** Режим карты для просмотра значения поля в точке. */
export class FieldValueModeProvider implements MapModeProvider {
  public readonly id = 'show-field-value';
  public readonly cursor = 'crosshair';
  public readonly blocked = false;

  /** Если `true`, значения обновляются при движении курсора, иначе по клику. */
  public moveMode: boolean = false;
  /** Функция для обновления значений в окне. */
  public updateWindow: (() => void) | null = null;

  /** Состояние для просмотра. */
  public state: FieldValueState = {};
  /** Слой, на котором считаются значения. */
  private layer: IMapLayer | null = null;

  public onClick(e: MouseEvent, stage: MapStage): void {
    if (!this.updateWindow || this.moveMode) return;
    this.updateData(stage.eventToPoint(e));
    this.updateWindow();
  }

  public onMouseMove(e: MouseEvent, stage: MapStage): void {
    if (!this.updateWindow || !this.moveMode) return;
    this.updateData(stage.eventToPoint(e));
    this.updateWindow();
  }

  /* --- --- */

  public getLayer(): IMapLayer | null {
    return this.layer;
  }

  public setLayer(layer: IMapLayer | null): void {
    if (this.layer === layer) return;
    this.layer = layer;

    this.state.point = undefined;
    this.state.xNode = undefined;
    this.state.yNode = undefined;
    this.state.value = undefined;
  }

  private updateData(point: Point): void {
    this.state.point = point;
    this.state.xNode = undefined;
    this.state.yNode = undefined;
    this.state.value = undefined;

    for (const field of this.layer.elements as MapField[]) {
      const value = getInterpolatedFieldValue(field, point);
      if (value === null) continue;

      this.state.xNode = Math.floor((point.x - field.x) * (1 / field.stepx));
      this.state.yNode = Math.floor((Math.abs(field.y - point.y)) * (1 / field.stepy));
      this.state.value = value;
      return;
    }
  }
}
