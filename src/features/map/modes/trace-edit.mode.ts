import { setCurrentTrace } from 'entities/objects';
import { MapStage } from '../lib/map-stage';
import { checkDistancePoints } from '../lib/selecting-utils';


export class TraceEditModeProvider implements MapModeProvider {
  public readonly id = 'trace-edit';
  public readonly cursor = 'default';
  public readonly blocked = false;

  /** Добавление/удаление точек к текущей трассе через клик по карте. */
  public onClick(e: MouseEvent, stage: MapStage): void {
    const data = stage.getMapData();
    const point = stage.eventToPoint(e);

    const mapPoint = data.points.find(p => checkDistancePoints(point, p, data.scale));
    if (!mapPoint) return;

    const currentTrace: TraceModel = stage.getExtraObject('trace');
    const nodes = currentTrace.nodes;
    const nodeID = mapPoint.UWID;

    if (nodes.some(node => node.id === nodeID)) {
      currentTrace.nodes = nodes.filter(node => node.id !== nodeID);
    } else {
      const newNode: TraceNode = {
        id: nodeID, name: mapPoint.name,
        x: mapPoint.x, y: mapPoint.y,
      };
      currentTrace.nodes = [...nodes, newNode];
    }
    setCurrentTrace({...currentTrace});
  }
}
