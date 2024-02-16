import {groupBy} from "../../../shared/lib";


/** Класс для управления инклинометрией скважины профиля. */
export class ProfileInclinometry implements IProfileIncl {
  /** Данные инклинометрии (скважина => отметки инклинометрии). */
  public data: Map<number, ProfileInclMark[]>;

  constructor(data: ProfileInclMark[]) {
    data = data.map(p => ({...p, ABSMARK: -p.ABSMARK}));

    const dataMap: Map<number, ProfileInclMark[]> = groupBy(
      data,
      el => el.NWELL_ID
    );

    dataMap.forEach((value, key) =>
      dataMap.set(key, value.sort(
        (a, b) => a.ABSMARK - b.ABSMARK
      ))
    );
    this.data = dataMap;
  }

  /** Возвращает значение глубины для указанной абсолютной отметки. */
  public getDepth(wellId: number, absMark: number): number {
    if (this.data === null) {
      return 0;
    }

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
}
