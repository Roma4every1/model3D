import { applyInfoIndexes } from './channels';
import { channelsAPI } from 'entities/channels/lib/channels.api';


/** Класс, реализующий загрузку данных для построения каротажа по трассе. */
export class CaratLoader implements ICaratLoader {
  /** Флаг для преждевременной остановки загрузки. */
  public flag: number;
  /** Кеш точек кривых. */
  public readonly cache: CurveDataCache;

  /** Названия каналов, необходимых для каждого трека. */
  private readonly attachedChannels: CaratAttachedChannel[];
  /** Название канала с точками привых. */
  private readonly curveDataChannel: CaratAttachedChannel;

  constructor(channels: CaratAttachedChannel[], curveDataChannel: CaratAttachedChannel) {
    this.flag = 0;
    this.cache = {};
    this.attachedChannels = channels;
    this.curveDataChannel = curveDataChannel;
  }

  public async getCaratData(ids: WellID[], channelData: ChannelDataDict): Promise<CaratData> {
    this.flag++;
    const curveIDs: CaratCurveID[] = [];
    const caratData: CaratData = [];

    for (const id of ids) {
      const [trackData, newCurveIDs] = this.getTrackData(id, channelData);
      caratData.push(trackData);
      curveIDs.push(...newCurveIDs);
    }

    await this.loadCurveData([...new Set(curveIDs)]);
    return caratData;
  }

  private getTrackData(id: WellID, channelData: ChannelDataDict): [CaratTrackData, CaratCurveID[]] {
    const dict: CaratTrackData = {};
    const curveIDs: CaratCurveID[] = [];

    for (const attachment of this.attachedChannels) {
      const data = channelData[attachment.name];
      if (!data) { dict[attachment.name] = []; continue; }

      if (!attachment.applied) {
        applyInfoIndexes(attachment, data.columns);
        if (attachment.styles) {
          data.columns.forEach(({ Name: name }, i) => {
            for (const style of attachment.styles) {
              if (style.columnName === name) style.columnIndex = i;
            }
          });
          attachment.styles = attachment.styles.filter(style => style.columnIndex >= 0);
        }
      }

      const wellIndex = attachment.info.well.index;
      const rows = data.rows.length && wellIndex !== -1
        ? data.rows.filter(row => row.Cells[wellIndex] === id)
        : [];

      if (attachment.type === 'curve-set') {
        const idIndex = attachment.info.id.index;
        const loadingIndex = attachment.info.defaultLoading.index;
        const defaultCurves = rows.filter(row => Boolean(row.Cells[loadingIndex]));
        curveIDs.push(...defaultCurves.map(row => row.Cells[idIndex]));
      }
      dict[attachment.name] = rows;
    }
    return [dict, curveIDs] as [CaratTrackData, CaratCurveID[]];
  }

  /** Дозагружает данные точек кривых. */
  private async loadCurveData(ids: CaratCurveID[]) {
    const idsToLoad: CaratCurveID[] = ids.filter(id => !this.cache[id]);
    if (idsToLoad.length === 0) return;

    const value = idsToLoad.map(String);
    const parameters = [{id: 'currentCurveIds', type: 'stringArray', value} as Parameter];
    const query = {order: []} as any;

    const flag = this.flag;
    const res = await channelsAPI.getChannelData(this.curveDataChannel.name, parameters, query);
    if (flag !== this.flag) return;

    const data = res.ok ? res.data.data : null;
    if (!data) return;

    if (!this.curveDataChannel.applied) applyInfoIndexes(this.curveDataChannel, data.columns);
    const idIndex = this.curveDataChannel.info.id.index;

    for (const row of data.rows) {
      const cells = row.Cells;
      this.cache[cells[idIndex]] = this.createCurveData(cells);
    }
  }

  /** Создаёт модель данных кривой. */
  private createCurveData(cells: any[]): CaratCurveData {
    const info = this.curveDataChannel.info;
    const pathSource = window.atob(cells[info.data.index]);

    return {
      path: new Path2D(pathSource),
      points: this.parseCurvePath(pathSource),
      top: cells[info.top.index],
      bottom: cells[info.bottom.index],
      min: cells[info.min.index],
      max: cells[info.max.index],
    };
  }

  /** Парсинг SVG-пути кривой. */
  private parseCurvePath(source: string): Point[] {
    const items = source.split('L');
    items[0] = items[0].substring(1);
    return items.map((item) => {
      const [x, y] = item.split(',');
      return {x: parseFloat(x), y: parseFloat(y)};
    });
  }
}
