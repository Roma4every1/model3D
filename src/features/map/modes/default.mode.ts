import { setCurrentWell } from 'entities/objects';
import { MapStage } from '../lib/map-stage';
import { checkDistancePoints } from '../lib/selecting-utils';


export class DefaultModeProvider implements MapModeProvider {
  public readonly id = 'default';
  public readonly cursor = 'default';
  public readonly blocked = false;

  constructor(private readonly activated: boolean) {}

  /** Выбор скважины через карту. */
  public onClick(e: MouseEvent, stage: MapStage): void {
    if (!this.activated) return;
    const data = stage.getMapData();
    const point = stage.eventToPoint(e);

    const mapPoint = data.points.find(p => checkDistancePoints(point, p, data.scale));
    if (!mapPoint || mapPoint === stage.getExtraObject('well')) return;

    stage.setExtraObject('well', mapPoint, true);
    if (!Number.isNaN(mapPoint.UWID)) setCurrentWell(mapPoint.UWID).then();
  }
}
