export class ProfileLayer implements IProfileLayer {
  public borderLine: ProfileLineData;

  public topBaseY: number;

  constructor(borderLine: ProfileLineData, topBaseY: number) {
    this.borderLine = borderLine;
    this.topBaseY = topBaseY;
  }

  getLithology () {

  }
}
