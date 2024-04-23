import { getInterpolatedFieldValue } from '../../map/lib/selecting-utils';
import { ProfileLayer } from './layer';


/** Класс, содержащий данные о пласте профиля. */
export class ProfilePlast implements IProfilePlast {
  /** Толищна одного слоя пласта в метрах. */
  private layerThickness = 0.1;

  public plastCode: number;

  public borderLine: ProfileBorderLineData;
  public maxThickness: number = 0;
  public maxY: number = -Infinity;
  public minY: number = Infinity;

  public layers: IProfileLayer[] = [];

  constructor(plastCode: number, tracePoints: TracePoint[], topBaseData: TopBaseMapsDataRaw[]) {
    this.plastCode = plastCode;
    this.createBorderLine(tracePoints, topBaseData);
    this.createPlastLayers();
  }

  /** Создание ограничивающих линий куска профиля данного пласта. */
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
          topAbsMark,
          well: p.nearestWell || null
        } as ProfileLinePoint;
      }
    );
  }

  /** Создание пластов слоя. */
  public createPlastLayers () {
    const layersCount = Math.floor(this.maxThickness / this.layerThickness);
    let lastLine = this.borderLine;

    for (let i = 1; i <= layersCount; i++) {
      const topBaseY = this.layerThickness * i;
      const newLine = this.borderLine.map((p, j) => {
        const newPoint: ProfileLinePoint = {...p};

        const thicknessInPoint = Math.abs(this.borderLine[j].topAbsMark - this.borderLine[j].baseAbsMark) / layersCount;

        newPoint.baseAbsMark = i === 1 ?
          this.borderLine[j].baseAbsMark :
          lastLine[j].topAbsMark;

        newPoint.topAbsMark = i === layersCount ?
          this.borderLine[j].topAbsMark :
          this.borderLine[j].baseAbsMark - thicknessInPoint * i;

        newPoint.nearestLitPiece = this.getNearestLitPieceInPoint(
          this.borderLine[j].well, newPoint.topAbsMark, newPoint.baseAbsMark
        );

        return newPoint;
      })
      lastLine = [...newLine];

      const layer = new ProfileLayer(newLine, topBaseY);
      this.layers.push(layer);
    }
  }

  private getNearestLitPieceInPoint(well: IProfileWell, topAbsMark: number, baseAbsMark: number) {
    const plastLitPieces = well?.lithology?.filter(l =>
      l.PL_ID === this.plastCode
    );
    if (!plastLitPieces?.length) return null;
    const inRange = plastLitPieces.filter(l =>
      Math.abs(l.KROW_ABS) < topAbsMark && Math.abs(l.PODOSH_ABS) > baseAbsMark
    );
    if (!inRange?.length) return null;
    return inRange.reduce((max, current) => {
      const delta = Math.abs(current.KROW_ABS - current.PODOSH_ABS) -
        Math.abs(max?.KROW_ABS - max?.PODOSH_ABS);
      return delta > 0 ? current : max;
    }, null);
  }
}
