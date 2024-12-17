import { MapStage } from '../lib/map-stage';
import { getNearestPointIndex } from '../lib/selecting-utils';


export class LineRemovePointModeProvider implements MapModeProvider {
  public readonly id = 'line-remove-point';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public onClick(e: MouseEvent, stage: MapStage): void {
    const element = stage.getActiveElement();
    if (element.type !== 'polyline' || element.arcs[0].path.length < 3) return;

    const point = stage.eventToPoint(e);
    const nearestIndex = getNearestPointIndex(point, stage.getMapData().scale, element);
    if (nearestIndex !== undefined) element.arcs[0].path.splice(nearestIndex * 2, 2);

    stage.updateActiveElement();
    stage.render();
  }
}
