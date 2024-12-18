import { squaredDistance } from 'shared/lib';
import { useObjectsStore, setSiteState } from 'entities/objects';
import { MapStage } from '../lib/map-stage';


export class SiteRemovePointModeProvider implements MapModeProvider {
  public readonly id = 'site-remove-point';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public onClick(e: MouseEvent, stage: MapStage): void {
    const site = useObjectsStore.getState().site.state.model;
    if (site.points.length < 2) return;

    const nearestPoint = getNearestPoint(stage.eventToPoint(e), stage.getMapData().scale, site);
    if (!nearestPoint) return;

    const newPoints = site.points.filter(p => p !== nearestPoint);
    setSiteState({model: {...site, points: newPoints}});
  }
}

function getNearestPoint({x, y}: Point, scale: MapScale, site: SiteModel): Point {
  let minDistance = Infinity;
  let nearestPoint: Point = null;
  const sr = (0.0026 * scale) ** 2;

  for (const point of site.points) {
    const sd = squaredDistance(x, y, point.x, point.y);
    if (sd >= minDistance) continue;
    minDistance = sd;
    if (sd < sr) nearestPoint = point;
  }
  return nearestPoint;
}
