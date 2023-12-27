import {ProfileInclinometry} from "./inclinometry.ts";

export class ProfileWell implements IProfileWell {
  public id: number;

  public x: number;
  public y: number;

  public inclinometry: IProfileIncl;
  public lithology: any;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  public createInclinometry (data: ProfileInclMark[]) {
    this.inclinometry = new ProfileInclinometry(data);
  }
}
