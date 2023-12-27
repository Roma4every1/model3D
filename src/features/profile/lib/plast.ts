import {getInterpolatedFieldValue} from "../../map/lib/selecting-utils.ts";
import {ProfileLayer} from "./layer.ts";

export class ProfilePlast implements IProfilePlast {
  /** Толищна одного слоя пласта в метрах. */
  private layerThickness = 0.1;

  public plastCode: number;

  public plastIncl: IProfileIncl;

  public borderLine: ProfileLineData;
  public maxThickness: number = 0;
  public maxY: number = -Infinity;
  public minY: number = Infinity;

  public layers: IProfileLayer[] = [];

  constructor(plastCode: number, tracePoints: TracePoint[], topBaseData: TopBaseMapsDataRaw[]) {
    this.plastCode = plastCode;
    this.createBorderLine(tracePoints, topBaseData);
    this.createPlastLayers();
  }

  public createBorderLine(tracePoints: TracePoint[], topBaseData: TopBaseMapsDataRaw[]) {
    const baseField = topBaseData.find(field => field.mapType === 'BASE');
    const topField = topBaseData.find(field => field.mapType === 'TOP');
    this.borderLine = tracePoints.map(p => {
        const baseAbsMark = getInterpolatedFieldValue(baseField.containerData, p);
        const topAbsMark = getInterpolatedFieldValue(topField.containerData, p);
        this.minY = Math.min(this.minY, baseAbsMark, topAbsMark);
        this.maxY = Math.max(this.maxY, baseAbsMark, topAbsMark);
        this.maxThickness = Math.max(this.maxThickness, Math.abs(topAbsMark - baseAbsMark))
        return {
          x: p.x,
          y: p.y,
          distance: p.distance,
          baseAbsMark,
          topAbsMark
        } as ProfileLinePoint;
      }
    );
  }

  public createPlastLayers () {
    const layersCount = Math.floor(this.maxThickness / this.layerThickness);
    let lastLine = this.borderLine;

    for (let i = 1; i <= layersCount; i++) {
      const topBaseY = this.layerThickness * i;
      const newLine = this.borderLine.map((p, j) => {
        const newPoint = {...p};

        newPoint.baseAbsMark = i === 1 ?
          this.borderLine[j].baseAbsMark :
          lastLine[j].topAbsMark;

        newPoint.topAbsMark = i === layersCount ?
          this.borderLine[j].topAbsMark :
          this.borderLine[j].baseAbsMark + topBaseY;

        return newPoint;
      })
      lastLine = [...newLine];

      const layer = new ProfileLayer(newLine, topBaseY);
      this.layers.push(layer);
    }
  }
}
