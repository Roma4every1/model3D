import { MapStage } from '../lib/map-stage';


export class LineAppendPointModeProvider implements MapModeProvider {
  public readonly id = 'line-append-point';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public onClick(e: MouseEvent, stage: MapStage): void {
    const element = stage.getActiveElement();
    if (element.type !== 'polyline') return;

    const point = stage.eventToPoint(e);
    element.arcs[0].path.push(point.x, point.y);

    stage.updateActiveElement();
    stage.render();
  }
}
