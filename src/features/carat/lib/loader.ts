import { cellsToRecords } from 'entities/channels';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { channelDataDictToRecords } from './channels';


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

  public async getCaratData(ids: WellID[], channelData: ChannelDataDict): Promise<ChannelRecordDict[]> {
    const curveIDs: CaratCurveID[] = [];
    const caratData: ChannelRecordDict[] = [];
    const needFilter = ids.length > 1;
    const data = channelDataDictToRecords(channelData);

    for (const id of ids) {
      const [trackData, newCurveIDs] = this.getTrackData(id, data, needFilter);
      caratData.push(trackData);
      curveIDs.push(...newCurveIDs);
    }

    await this.loadCurveData([...new Set(curveIDs)]);
    return caratData;
  }

  private getTrackData(id: WellID, data: ChannelRecordDict, needFilter: boolean): [ChannelRecordDict, CaratCurveID[]] {
    const dict: ChannelRecordDict = {};
    const curveIDs: CaratCurveID[] = [];

    for (const attachment of this.attachedChannels) {
      let records = data[attachment.name];
      if (!records) { dict[attachment.name] = []; continue; }

      if (needFilter && records.length) {
        const wellColumnName = attachment.info.well.name;
        records = records.filter(row => row[wellColumnName] === id);
      }

      if (attachment.type === 'curve-set') {
        const idName = attachment.info.id.name;
        const loadingName = attachment.info.defaultLoading.name;
        const defaultCurves = records.filter(record => Boolean(record[loadingName]));
        curveIDs.push(...defaultCurves.map(record => record[idName]));
      }
      dict[attachment.name] = records;
    }
    return [dict, curveIDs] as [ChannelRecordDict, CaratCurveID[]];
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
    const records = cellsToRecords(data);
    const idColumnName = this.curveDataChannel.info.id.name;

    for (const record of records) {
      this.cache[record[idColumnName]] = this.createCurveData(record);
    }
  }

  /** Создаёт модель данных кривой. */
  private createCurveData(record: ChannelRecord): CaratCurveData {
    const info = this.curveDataChannel.info;
    const pathSource = window.atob(record[info.data.name]);

    return {
      path: new Path2D(pathSource),
      points: this.parseCurvePath(pathSource),
      top: record[info.top.name],
      bottom: record[info.bottom.name],
      min: record[info.min.name],
      max: record[info.max.name],
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
