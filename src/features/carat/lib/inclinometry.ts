import { round } from 'shared/lib';


/** Опорная точка инклинометрии: значение глубины и абсолютной отметки. */
interface InclinometryMark {
  /** Значение глубины. */
  depth: number;
  /** Значение абсолютной отметки. */
  absMark: number;
}

/** Класс для управления инклинометрией. */
export class CaratInclinometry implements ICaratInclinometry {
  /** Даннные канала инклинометрии. */
  public readonly channel: PropertyAttachedChannel;
  /** Мемоизированные значения абсолютных отметок по глубине. */
  private readonly depthToAbsMap: Map<number, number>;
  /** Мемоизированные значения глубин по абсолютным отметкам. */
  private readonly absToDepthMap: Map<number, number>;
  /** Опорные точки инклинометрии для интерполяции; если есть, длина всегда >= 2. */
  private data: InclinometryMark[] | null;

  constructor(channel: PropertyAttachedChannel) {
    this.channel = channel;
    this.depthToAbsMap = new Map();
    this.absToDepthMap = new Map();
    this.data = null;
  }

  /** Обновление опорных точек инклинометрии. */
  public setData(channelData: ChannelRecordDict): void {
    const records = channelData[this.channel.id];
    if (records && records.length > 1) {
      const depthName = this.channel.info.depth.columnName;
      const absMarkName = this.channel.info.absMark.columnName;
      this.data = records.map(r => ({depth: r[depthName], absMark: r[absMarkName]}));
    } else {
      this.data = null;
    }
    this.depthToAbsMap.clear();
    this.absToDepthMap.clear();
  }

  /** Возвращает значение абсолютной отметки для указанной глубины. */
  public getAbsMark(depth: number): number {
    if (this.data === null) return -depth;
    let absMark = this.depthToAbsMap.get(depth);

    if (absMark === undefined) {
      absMark = round(this.calcAbsMark(depth), 1);
      this.depthToAbsMap.set(depth, absMark);
    }
    return absMark;
  }

  /** Возвращает значение глубины для указанной абсолютной отметки. */
  public getDepth(absMark: number): number {
    if (this.data === null) return -absMark;
    let depth = this.absToDepthMap.get(absMark);

    if (depth === undefined) {
      depth = round(this.calcDepth(absMark), 1);
      this.absToDepthMap.set(absMark, depth);
    }
    return depth;
  }

  public getMaxAbsMark(): number | null {
    if (this.data === null) return null;
    return Math.max(...this.data.map(i => i.absMark));
  }

  public hasData(): boolean {
    return this.data === null;
  }

  private calcAbsMark(depth: number): number {
    let left = 0;
    let right = this.data.length - 1;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      const middlePoint = this.data[middle];
      if (middlePoint.depth === depth) return middlePoint.absMark;

      if (middlePoint.depth < depth) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    let markBefore = this.data[right];
    let markAfter = this.data[left];

    if (!markAfter) {
      markAfter = markBefore;
      markBefore = this.data[right - 1];
    }
    else if (!markBefore) {
      markBefore = markAfter;
      markAfter = this.data[left + 1];
    }
    return interpolateAbsMark(markBefore, markAfter, depth);
  }

  private calcDepth(absMark: number): number {
    const lastIndex = this.data.length - 1;
    let minMark1 = this.data[0], minMark2 = this.data[1];
    let maxMark1 = this.data[lastIndex - 1], maxMark2 = this.data[lastIndex];

    for (let i = 0; i < lastIndex; ++i) {
      let m1 = this.data[i], a1 = m1.absMark;
      let m2 = this.data[i + 1], a2 = m2.absMark;

      if (a1 === absMark) return m1.depth;
      if (a2 === absMark) return m2.depth;

      if (a1 > a2) {
        let temp: any = m1;
        m1 = m2; m2 = temp;
        temp = a1;
        a1 = a2; a2 = temp;
      }
      if (a1 < absMark && absMark < a2) {
        return interpolateDepth(m1, m2, absMark);
      }
      if (minMark1.absMark > a1) {
        minMark2 = minMark1;
        minMark1 = m1;
      }
      if (maxMark2.absMark > a2) {
        maxMark1 = maxMark2;
        maxMark2 = m2;
      }
    }
    if (minMark1.absMark > absMark) {
      return interpolateDepth(minMark1, minMark2, absMark);
    } else {
      return interpolateDepth(maxMark1, maxMark2, absMark);
    }
  }
}

/** Линейная интерполяция абсолютной отметки по двум опорным точкам. */
function interpolateAbsMark(m1: InclinometryMark, m2: InclinometryMark, depth: number): number {
  const { depth: x0, absMark: y0 } = m1;
  const { depth: x1, absMark: y1 } = m2;
  return ((depth - x0) / (x1 - x0)) * (y1 - y0) + y0;
}

/** Линейная интерполяция глубины по двум опорным точкам. */
function interpolateDepth(m1: InclinometryMark, m2: InclinometryMark, absMark: number): number {
  const { absMark: x0, depth: y0 } = m1;
  const { absMark: x1, depth: y1 } = m2;
  return ((absMark - x0) / (x1 - x0)) * (y1 - y0) + y0;
}
