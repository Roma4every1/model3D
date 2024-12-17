import { squaredSegmentDistance } from 'shared/lib';
import { MapStage } from '../lib/map-stage';


export class LineInsertPointModeProvider implements MapModeProvider {
  public readonly id = 'line-insert-point';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public onClick(e: MouseEvent, stage: MapStage): void {
    const element = stage.getActiveElement();
    if (element.type !== 'polyline' || element.arcs[0].path.length < 4) return;

    insertPointToArc(stage.eventToPoint(e), element.arcs[0]);
    stage.updateActiveElement();
    stage.render();
  }
}

function insertPointToArc({x, y}: Point, {path, closed}: PolylineArc): void {
  let distance: number;
  let minDistance = Infinity;

  let segmentCounter = 0;
  let nearestSegmentIndex = -1;

  let i = 0;
  const iMax = path.length - 2;

  while (i < iMax) {
    distance = squaredSegmentDistance(x, y, path[i], path[i + 1], path[i + 2], path[i + 3]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestSegmentIndex = segmentCounter;
    }
    i += 2;
    segmentCounter += 1;
  }
  if (closed) {
    distance = squaredSegmentDistance(x, y, path[i], path[i + 1], path[0], path[1]);
    if (distance < minDistance) nearestSegmentIndex = segmentCounter;
  }
  path.splice(nearestSegmentIndex * 2 + 2, 0, x, y);
}
