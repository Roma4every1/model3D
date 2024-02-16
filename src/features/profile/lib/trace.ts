import {getPointsDistance2D,} from "./utils.ts";
import {ProfileWell} from "./well.ts";


/** Класс, содержащий данные о трассе профиля. */
export class ProfileTrace implements IProfileTrace {
  /** Шаг промежуточных точек трассы профиля. */
  private step = 200;

  /** Узлы трассы. */
  public nodes: ProfileWell[] = [];
  /** Скважины трассы (в том числе дополнительные для нахождения литологии на слоях). */
  public wells: ProfileWell[] = [];

  /** Расстояние вдоль трассы. */
  public distance: number;
  /** Линии трассы между узлами. */
  public lines: TraceLineData[] = [];
  /** Промежуточные точки трассы профиля. */
  public points: TracePoint[] = [];

  constructor(trace: TraceModel, ustChannel: Channel) {
    const wellsPoints: WellPoint[] = ustChannel.data.rows.map(r => ({
      WELL_ID: r.Cells[0],
      x: r.Cells[2],
      y: -r.Cells[1]
    }));
    this.nodes = trace?.nodes?.map(n => {
      const well = wellsPoints.find(u => u.WELL_ID === n.id);
      return new ProfileWell(well.WELL_ID, well.x, well.y);
    });

    this.getLines();
    this.wells = this.getAdditionalWells(wellsPoints);
  }

  /** Находит все промежуточные точки трассы и записывает их в this.points. */
  public getLines() {
    if (!this.nodes) return null;
    let lastLineRemainder = 0;

    this.points.push(this.nodes[0].toTracePoint(0));

    for (let i = 1; i < this.nodes.length; i++) {
      const line = this.getLinePoints(
        this.nodes[i - 1],
        this.nodes[i],
        lastLineRemainder
      );
      lastLineRemainder = line.remainder;

      this.lines.push(line);
      this.points = [...this.points, ...line.points];
      this.distance += line.distance;
    }

    this.distance += lastLineRemainder;
    this.points.push(this.nodes[this.nodes.length - 1].toTracePoint(this.distance));
  }

  /** Находит промежуточные точки трассы между двумя узлами, с шагом, заданным в поле step. */
  public getLinePoints(node1: ProfileWell, node2: ProfileWell, remainder = 0): TraceLineData {

    const result = [];
    const distance = Math.sqrt(Math.pow(node1.x - node2.x, 2) +
      Math.pow(node1.y - node2.y, 2))

    let newRemainder = 0;
    for (let c = this.step - remainder; c < distance; c += this.step) {
      newRemainder = distance - c;
      result.push({
        x: node1.x + c / distance * (node2.x - node1.x),
        y: node1.y + c / distance * (node2.y - node1.y),
      })
    }

    return {
      startNode: node1,
      endNode: node2,
      points: result,
      remainder: newRemainder,
      distance
    };
  }

  /** Находит ближайшую скважину для каждой промежуточной точки трассы.
   * Возвращает список скважин без повторений.
   * */
  private getAdditionalWells(wellsPoints: WellPoint[]) {
    const wells: ProfileWell[] = [];

    for (const p of this.points) {
      const nearestWell = this.getPointNearestWell(p, wellsPoints);
      if (!wells.find(w => w.id === nearestWell.id))
        wells.push(nearestWell);
    }

    return wells;
  }

  /** Находит ближайшую скважину (из массива объектов с координатами скважин) к заданной точке. */
  private getPointNearestWell(point: TracePoint, wellsPoints: WellPoint[]): ProfileWell {
    let minDistance = Infinity;
    let minDistanceWell: WellPoint;
    for (const w of wellsPoints) {
      const distance = getPointsDistance2D(w, point);
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceWell = w;
      }
    }
    const well = new ProfileWell(minDistanceWell.WELL_ID, minDistanceWell.x, minDistanceWell.y);
    point.nearestWell = well;
    return well;
  }
}
