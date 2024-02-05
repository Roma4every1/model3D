import {ProfileInclinometry} from "./inclinometry.ts";

export class ProfileWell implements IProfileWell {
  public id: number;

  public x: number;
  public y: number;

  public inclinometry: IProfileIncl;
  public lithology: ProfileLitPiece[];

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  public createInclinometry (data: ProfileInclMark[]) {
    this.inclinometry = new ProfileInclinometry(data);
  }

  public toTracePoint(distance: number): TracePoint {
    return {
      x: this.x,
      y: this.y,
      distance
    }
  }

  public setLithologyPieces(pieces: ProfileLitPiece[]) {
    this.lithology = pieces.filter(p => p.NWELL_ID === this.id);
  }
}
