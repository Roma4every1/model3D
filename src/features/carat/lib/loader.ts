import { cellsToRecords } from 'entities/channels';
import { channelDataDictToRecords } from './channels';
import { serializeChannelRecord } from 'entities/parameters/lib/table-row';
import { channelsAPI } from 'entities/channels/lib/channels.api';


/** Класс, реализующий загрузку данных для построения каротажа по трассе. */
export class CaratLoader implements ICaratLoader {
  /** Флаг для преждевременной остановки загрузки. */
  public flag: number;
  /** Кеш точек кривых. */
  public readonly cache: CurveDataCache;

  /** Каналы, необходимых для каждого трека. */
  private readonly attachedChannels: CaratAttachedChannel[];
  /** Канал с точками привых. */
  private readonly curveDataChannel: CaratAttachedChannel;
  /** Канал с инклинометрией. */
  private readonly inclinometryChannel: CaratAttachedChannel;

  constructor(
    channels: CaratAttachedChannel[],
    curveDataChannel: CaratAttachedChannel, inclinometryChannel: CaratAttachedChannel,
  ) {
    this.flag = 0;
    this.cache = {};
    this.attachedChannels = channels;
    this.curveDataChannel = curveDataChannel;
    this.inclinometryChannel = inclinometryChannel;
  }

  public async getCaratData(ids: WellID[], channelData: ChannelDataDict): Promise<ChannelRecordDict[]> {
    const flag = this.flag;
    const curveIDs: CaratCurveID[] = [];
    const caratData: ChannelRecordDict[] = [];
    const isTrace = ids.length > 1;
    const data = channelDataDictToRecords(channelData);

    for (const id of ids) {
      const [trackData, newCurveIDs] = this.getTrackData(id, data, isTrace);
      caratData.push(trackData);
      curveIDs.push(...newCurveIDs);
    }

    if (isTrace && this.inclinometryChannel) {
      const inclinometryWellData = channelData[this.inclinometryChannel.name];
      if (inclinometryWellData) {
        const inclinometryInfo = this.inclinometryChannel.inclinometry;
        const mapper = (record) => this.loadInclinometry(record, inclinometryInfo.properties);
        const recordList = await Promise.all(cellsToRecords(inclinometryWellData).map(mapper));

        const inclinometryDataName = inclinometryInfo.name;
        const wellColumnName = inclinometryInfo.info.well.name;

        for (const records of recordList) {
          if (records.length === 0) continue;
          const wellID = records[0][wellColumnName];
          const idx = ids.findIndex(i => i === wellID);
          if (idx !== -1) caratData[idx][inclinometryDataName] = records;
        }
      }
    }

    console.log(caratData);
    if (flag === this.flag) await this.loadCurveData([...new Set(curveIDs)]);
    return caratData;
  }

  private getTrackData(id: WellID, data: ChannelRecordDict, isTrace: boolean): [ChannelRecordDict, CaratCurveID[]] {
    const dict: ChannelRecordDict = {};
    const curveIDs: CaratCurveID[] = [];

    for (const channelName in data) {
      const attachment = this.attachedChannels.find(a => a.name === channelName);
      let records = data[channelName];
      if (!records) { dict[channelName] = []; continue; }

      if (isTrace && records.length) {
        const wellColumnName = attachment.info.well.name;
        records = records.filter(row => row[wellColumnName] === id);
      }

      if (attachment.type === 'curve-set') {
        const idName = attachment.info.id.name;
        const loadingName = attachment.info.defaultLoading.name;
        const defaultCurves = records.filter(record => Boolean(record[loadingName]));
        curveIDs.push(...defaultCurves.map(record => record[idName]));
      }
      dict[channelName] = records;
    }
    return [dict, curveIDs] as [ChannelRecordDict, CaratCurveID[]];
  }

  private async loadInclinometry(record: ChannelRecord, properties: ChannelProperty[]): Promise<ChannelRecord[]> {
    console.log(record, properties)
    const channelName = this.inclinometryChannel.inclinometry.name;
    const value = serializeChannelRecord(record, properties);
    const parameters = [{id: 'currentWellGeom', type: 'tableRow', value} as Parameter];
    const query = {order: []} as any;

    const res = await channelsAPI.getChannelData(channelName, parameters, query);
    const data = res.ok ? res.data.data : null;
    return data ? cellsToRecords(data) : [];
  }

  /** Дозагружает данные точек кривых. */
  public async loadCurveData(ids: CaratCurveID[]): Promise<CaratCurveID[]> {
    const idsToLoad: CaratCurveID[] = ids.filter(id => !this.cache[id]);
    if (idsToLoad.length === 0) return idsToLoad;

    const value = idsToLoad.map(String);
    const parameters = [{id: 'currentCurveIds', type: 'stringArray', value} as Parameter];
    const query = {order: []} as any;

    const res = await channelsAPI.getChannelData(this.curveDataChannel.name, parameters, query);
    const data = res.ok ? res.data.data : null;
    if (!data) return;

    const records = cellsToRecords(data);
    const idColumnName = this.curveDataChannel.info.id.name;

    for (const record of records) {
      this.cache[record[idColumnName]] = this.createCurveData(record);
    }
    return idsToLoad;
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
