import { MapStage } from '../lib/map-stage';
import { getNearestPointIndex } from '../lib/selecting-utils';


export class LineMovePointModeProvider implements MapModeProvider {
  public readonly id = 'line-move-point';
  public readonly cursor = 'default';
  public readonly blocked = true;
  private pIndex: number;

  public onMouseDown(e: MouseEvent, stage: MapStage): void {
    const element = stage.getActiveElement();
    if (element.type !== 'polyline') return;
    this.pIndex = getNearestPointIndex(stage.eventToPoint(e), stage.getMapData().scale, element);
  }

  public onMouseUp(): void {
    this.pIndex = undefined;
  }

  public onMouseLeave(): void {
    this.pIndex = undefined;
  }

  public onMouseMove(e: MouseEvent, stage: MapStage): void {
    if (this.pIndex === undefined) return;
    const point = stage.eventToPoint(e);
    const element = stage.getActiveElement() as MapPolyline;

    const path = element.arcs[0].path;
    path[this.pIndex * 2] = point.x;
    path[this.pIndex * 2 + 1] = point.y;
    stage.render();
  }
}
