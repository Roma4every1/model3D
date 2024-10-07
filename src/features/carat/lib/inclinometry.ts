import { round } from 'shared/lib';


/** Отображение "глубина => абс. отметка". */
type InclinometryMap = Map<number, number>;

/** Опорная точка инклинометрии.
 * + `depth: number`
 * + `absMark: number`
 */
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
  /** Данные инклинометрии (глубина => абс. отметка). */
  private data: InclinometryMap | null;

  /** Данные инклинометрии для интерполяции. */
  private interpolationData: InclinometryMark[];
  /** Минимальная посчитанная отметка глубины. */
  private min: number | null;
  /** Максимальная посчитанная отметка глубины. */
  private max: number | null;

  constructor(channel: PropertyAttachedChannel) {
    this.channel = channel;
    this.data = null;

    this.interpolationData = [];
    this.min = null;
    this.max = null;
  }

  /** Возвращает значение абсолютной отметки для указанной глубины. */
  public getAbsMark(depth: number): number {
    if (this.data === null) {
      return -depth;
    }
    if (depth < this.min) {
      this.addMarks(depth, this.min);
      this.min = depth;
    }
    if (depth > this.max) {
      this.addMarks(this.max, depth);
      this.max = depth;
    }
    return this.data.get(depth);
  }

  /** Возвращает значение глубины для указанной абсолютной отметки. */
  public getDepth(absMark: number): number {
    if (this.data === null) {
      return -absMark;
    }
    for (const pair of this.data) {
      if (absMark === pair[1]) return pair[0];
    }
    return -absMark;
  }

  /** Обновление данных интерполяции. */
  public setData(channelData: ChannelRecordDict): void {
    const rows = channelData[this.channel.id];
    if (rows?.length) {
      const info = this.channel.info;
      this.interpolationData = rows.map((record: ChannelRecord): InclinometryMark => ({
        depth: record[info.depth.columnName],
        absMark: record[info.absMark.columnName],
      }));
    } else {
      this.interpolationData = [];
    }
    this.clear();
  }

  /** Обновление данных инклинометрии под указанный вьюпорт. */
  public updateMarks(viewport: CaratViewport): void {
    const minDepth = viewport.min - viewport.scroll.step;
    const maxDepth = viewport.max + viewport.scroll.step;

    if (this.interpolationData.length < 2) {
      this.clear();
      return;
    }
    if (this.data === null) {
      this.min = minDepth; this.max = maxDepth;
      this.data = new Map();
      this.addMarks(minDepth, maxDepth);
      return;
    }
    if (minDepth < this.min) {
      this.addMarks(minDepth, this.min);
      this.min = minDepth;
    }
    if (maxDepth > this.max) {
      this.addMarks(this.max, maxDepth);
      this.max = maxDepth;
    }
  }

  /** Строит интервал глубин и абсолютных отметок. */
  private addMarks(from: number, to: number): void {
    from = Math.floor(from);
    to = Math.ceil(to);

    let index = this.findNearestMark(from);
    const maxIndex = this.interpolationData.length - 2;

    let p1: InclinometryMark, p2: InclinometryMark;
    if (index <= maxIndex) {
      p1 = this.interpolationData[index];
      p2 = this.interpolationData[index + 1];
    } else {
      p1 = this.interpolationData[index - 1];
      p2 = this.interpolationData[index];
    }

    let i = 0, depth = from;
    const length = (to - from) + 1;

    while (i < length) {
      if (depth >= p2.depth && index < maxIndex) {
        p1 = p2;
        p2 = this.interpolationData[index + 2];
        ++index;
      }
      this.data.set(depth, this.interpolate(p1, p2, depth));
      ++i; ++depth;
    }
  }

  /** Бинарным поиском находит индекс отметки, ближайшей по Y. */
  private findNearestMark(depth: number): number {
    let start = 0;
    let end = this.interpolationData.length - 1;
    if (depth >= this.interpolationData[end].depth) return end;

    while (start <= end) {
      const middleIndex = Math.floor((start + end) / 2);
      const markDepth = this.interpolationData[middleIndex].depth;

      if (depth < markDepth) {
        end = middleIndex - 1;
      } else {
        start = middleIndex + 1;
      }
    }
    return start;
  }

  /** Линейная интерполяция абсолютной отметки по двум опорным точкам. */
  private interpolate(p1: InclinometryMark, p2: InclinometryMark, depth: number): number {
    const { depth: x0, absMark: y0 } = p1;
    const { depth: x1, absMark: y1 } = p2;
    return round(((depth - x0) / (x1 - x0)) * (y1 - y0) + y0, 1);
  }

  /** Очищает данные. */
  private clear(): void {
    this.min = null;
    this.max = null;
    this.data = null;
  }
}
