import { MapStage } from '../lib/map-stage';


export class ElementDragModeProvider implements MapModeProvider {
  public readonly id = 'element-drag';
  public readonly cursor = 'default';
  public readonly blocked = true;
  private ignoreMove: boolean = true;

  public onMouseDown(): void {
    this.ignoreMove = false;
  }

  public onMouseUp(_: MouseEvent, stage: MapStage): void {
    if (this.ignoreMove) return;
    stage.updateActiveElement();
    this.ignoreMove = true;
  }

  public onMouseLeave(_: MouseEvent, stage: MapStage): void {
    if (this.ignoreMove) return;
    stage.updateActiveElement();
    this.ignoreMove = true;
  }

  public onMouseMove(e: MouseEvent, stage: MapStage): void {
    if (this.ignoreMove) return;
    const element = stage.getActiveElement();
    if (element.type === 'polyline' || element.type === 'field') return;

    const point = stage.eventToPoint(e);
    element.x = Math.round(point.x);
    element.y = Math.round(point.y);
    stage.render();
  }
}
