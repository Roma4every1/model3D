import {getPointsDistance2D,} from "./utils.ts";
import {ProfileWell} from "./well.ts";

export class ProfileTrace implements IProfileTrace {
  private step = 200;

  public nodes: ProfileWell[] = [];
  public wells: ProfileWell[] = [];

  public distance: number;
  public lines: TraceLineData[] = [];
  public points: TracePoint[] = [];

  constructor(trace: TraceModel, ustChannel: Channel) {
    const wellsPoints: UstPoint[] = ustChannel.data.rows.map(r => ({
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

  private getAdditionalWells(wellsPoints: UstPoint[]) {
    const wells: ProfileWell[] = [];

    for (const p of this.points) {
      const nearestWell = this.getPointNearestWell(p, wellsPoints);
      if (!wells.find(w => w.id === nearestWell.id))
        wells.push(nearestWell);
    }

    return wells;
  }

  private getPointNearestWell(point: TracePoint, wellsPoints: UstPoint[]): ProfileWell {
    let minDistance = Infinity;
    let minDistanceWell: UstPoint;
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

  public addWellsInclinometry() {

  }
}
