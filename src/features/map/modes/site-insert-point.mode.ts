import { squaredSegmentDistance } from 'shared/lib';
import { useObjectsStore, setSiteState } from 'entities/objects';
import { MapStage } from '../lib/map-stage';


export class SiteInsertPointModeProvider implements MapModeProvider {
  public readonly id = 'site-insert-point';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public onClick(e: MouseEvent, stage: MapStage): void {
    const site = useObjectsStore.getState().site.state.model;
    insertPoint(stage.eventToPoint(e), site);
    setSiteState({model: {...site}});
  }
}

function insertPoint(point: Point, site: SiteModel): void {
  const { x, y } = point;
  const points = site.points;

  let distance: number;
  let minDistance = Infinity;
  let nearestSegmentIndex = -1;

  let i = 0;
  const iMax = points.length - 1;

  while (i < iMax) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[i + 1];

    distance = squaredSegmentDistance(x, y, x1, y1, x2, y2);
    if (distance < minDistance) {
      minDistance = distance;
      nearestSegmentIndex = i;
    }
    ++i;
  }
  const first = points[0], last = points[i];
  distance = squaredSegmentDistance(x, y, last.x, last.y, first.x, first.y);
  if (distance < minDistance) nearestSegmentIndex = i;
  points.splice(nearestSegmentIndex + 1, 0, point);
}
