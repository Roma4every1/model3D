import {groupBy} from "../../../shared/lib";


/** Класс для управления инклинометрией профиля. */
export class ProfileInclinometry implements IProfileIncl {
  /** Даннные канала инклинометрии. */
  public readonly channelData: ProfileInclMark[];
  /** Данные инклинометрии (абс. отметка => расстояния смещения). */
  public data: Map<number, ProfileInclMark[]>;

  /** Данные инклинометрии для интерполяции. */
  private interpolationData: any;
  // /** Минимальная посчитанная абсолютная отметка. */
  // private minAbs: number | null;
  // /** Максимальная посчитанная абсолютная отметка. */
  // private maxAbs: number | null;

  constructor(data: ProfileInclMark[]) {
    this.channelData = data.map(p => ({...p, ABSMARK: -p.ABSMARK}));

    const dataMap: Map<number, ProfileInclMark[]> = groupBy(
      this.channelData,
      el => el.NWELL_ID
    );

    // const checkFn = el => el.ABSMARK >= min && el.ABSMARK <= max;
    // .filter((el, i) =>
    //     checkFn(el) ||
    //     (value[i - 1] && checkFn(value[i - 1])) ||
    //     (value[i + 1] && checkFn(value[i + 1]))
    //   )
    dataMap.forEach((value, key) =>
      dataMap.set(key, value.sort(
        (a, b) => a.ABSMARK - b.ABSMARK
      ))
    );
    this.data = dataMap;

    // this.minAbs = min;
    // this.maxAbs = max;
  }

  /** Возвращает значение глубины для указанной абсолютной отметки. */
  public getDepth(wellId: number, absMark: number): number {
    if (this.data === null) {
      return 0;
    }
    // if (absMark < this.minAbs) {
    //   return null;
    // }
    // if (absMark > this.maxAbs) {
    //   return null;
    // }

    const {smaller, greater} = this.findNearestMarksByAbs(wellId, absMark);
    if (!smaller || !greater) return null;
    return this.interpolate(smaller, greater, absMark);
  }

  /** Находит верхнюю и нижнюю ближайшее отметки по значению абсолютной отметки. */
  private findNearestMarksByAbs(wellId: number, absMark: number):
    { smaller: ProfileInclMark, greater: ProfileInclMark } {
    const wellData = this.data.get(wellId)
    if (!wellData) return {smaller: null, greater: null}

    const lowerIndex = wellData.findIndex(obj =>
      obj.ABSMARK >= absMark
    );
    const smaller = lowerIndex < 0 ?
      null :
      wellData[lowerIndex - 1] || null;
    const greater = lowerIndex >= wellData.length ?
      null :
      wellData[lowerIndex] || null;

    return {smaller, greater}
  }

  /** Линейная интерполяция глубины по двум опорным точкам. */
  private interpolate(p1: ProfileInclMark, p2: ProfileInclMark, absMark: number): number {
    const {ABSMARK: x0, DEPTH: y0} = p1;
    const {ABSMARK: x1, DEPTH: y1} = p2;
    return Math.round(((absMark - x0) / (x1 - x0)) * (y1 - y0) + y0);
  }

  /** Очищает данные. */
  private clear(): void {
    // this.minAbs = null;
    // this.maxAbs = null;
    this.data = null;
  }
}
