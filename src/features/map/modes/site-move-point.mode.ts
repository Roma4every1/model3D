import { squaredDistance } from 'shared/lib';
import { useObjectsStore, setSiteState } from 'entities/objects';
import { MapStage } from '../lib/map-stage';


export class SiteMovePointModeProvider implements MapModeProvider {
  public readonly id = 'site-move-point';
  public readonly cursor = 'default';
  public readonly blocked = true;

  private site: SiteModel;
  private point: Point;

  public onMouseDown(e: MouseEvent, stage: MapStage): void {
    const scale = stage.getMapData().scale;
    this.site = useObjectsStore.getState().site.state.model;
    this.point = getNearestPoint(stage.eventToPoint(e), scale, this.site.points);
  }

  public onMouseUp(): void {
    if (this.point) setSiteState({model: {...this.site}});
    this.site = undefined;
    this.point = undefined;
  }

  public onMouseLeave(): void {
    if (this.point) setSiteState({model: {...this.site}});
    this.site = undefined;
    this.point = undefined;
  }

  public onMouseMove(e: MouseEvent, stage: MapStage): void {
    if (this.point === undefined) return;
    const eventPoint = stage.eventToPoint(e);
    this.point.x = eventPoint.x;
    this.point.y = eventPoint.y;
    stage.render();
  }
}

export function getNearestPoint(p: Point, scale: MapScale, points: Point[]): Point | undefined {
  let nearestPoint: Point;
  let minDistance = Infinity;

  const { x, y } = p;
  const sr = (0.0026 * scale) ** 2;

  for (const point of points) {
    const sd = squaredDistance(x, y, point.x, point.y);
    if (sd >= minDistance) continue;
    minDistance = sd;
    if (sd < sr) nearestPoint = point;
  }
  return nearestPoint;
}
