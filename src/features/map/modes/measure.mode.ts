import type { MeasurerState } from '../extra-objects/measure.object';
import { MapStage } from '../lib/map-stage';
import { distance } from 'shared/lib';


export class MeasureModeProvider implements MapModeProvider {
  public readonly id = 'measure';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public active: boolean = true;
  public degrees: boolean = true;
  public updateWindow: (() => void) | null = null;

  /** Добавление точек к измерителю через клик по карте. */
  public onClick(e: MouseEvent, stage: MapStage): void {
    if (!this.updateWindow || !this.active) return;
    const oldState = stage.getExtraObject<MeasurerState>('measure');
    const newState = addMeasurePoint(oldState, stage.eventToPoint(e));

    stage.setExtraObject('measure', newState);
    stage.render();
    this.updateWindow();
  }
}

function addMeasurePoint(state: MeasurerState, point: Point): MeasurerState {
  if (!state) {
    return {nodes: [{point}], area: 0, totalLength: 0};
  }
  const nodes = state.nodes;
  const first = nodes[0];
  const prev = nodes.at(-1);

  if (nodes.length > 1) {
    [prev.startAngle, prev.endAngle] = calcAngle(nodes.at(-2).point, prev.point, point);
    if (nodes.length === 2) {
      state.firstAngle = prev.startAngle - prev.endAngle;
    } else {
      state.firstAngle = calcFirstAngle(first.point, nodes[1].point, prev.point, point);
    }
    first.distance = distance(point, first.point);
  }
  const d = distance(prev.point, point);
  nodes.push({point: point, distance: d});
  state.totalLength += d;

  if (nodes.length > 2) {
    const last = nodes.at(-1);
    [first.startAngle, first.endAngle] = calcAngle(last.point, first.point, nodes[1].point);
    [last.startAngle, last.endAngle] = calcAngle(nodes.at(-2).point, last.point, first.point);
    state.area = calcArea(nodes.map(n => n.point));
  }
  return {...state};
}

function calcAngle(p1: Point, p2: Point, p3: Point): [number, number] {
  let start = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let end = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  return [start, end];
}

function calcFirstAngle(p1: Point, p2: Point, p3: Point, p4: Point): number {
  if ((p1.x === p2.x && p1.y === p2.y) || (p3.x === p4.x && p3.y === p4.y)) return 0;
  const k1 = (p1.y - p2.y) / (p1.x - p2.x);
  const k2 = (p3.y - p4.y) / (p3.x - p4.x);
  return Math.abs(Math.atan2(k1 - k2, 1 + k1 * k2));
}

function calcArea(points: Point[]): number {
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; ++i) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}
