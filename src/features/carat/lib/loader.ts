import { cellsToRecords } from 'entities/channels';
import { channelDictToRecords } from './channels';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { channelsAPI } from 'entities/channels/lib/channels.api';


/** Класс, реализующий загрузку данных для построения каротажа по трассе. */
export class CaratLoader implements ICaratLoader {
  /** Фиксированное название параметра для загрузки точек кривых. */
  private static readonly curveDataParameterID = 'currentCurveIds';
  /** Фиксированное название параметра для загрузки инклинометрии. */
  private static readonly inclinometryParameterID = 'currentWellGeom';
  /** Максимальное количество кривых в кеше. */
  private static readonly maxCacheCurveCount = 20;

  /** Флаг для преждевременной остановки загрузки. */
  public flag: number;
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public setLoading: (l: Partial<CaratLoading>) => void;

  /** Кеш точек кривых. */
  public readonly cache: CurveDataCache;
  /** Счётчик добавления кривых. */
  private curveCounter: number;

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
    this.curveCounter = 0;
    this.cache = {};
    this.attachedChannels = channels;
    this.curveDataChannel = curveDataChannel;
    this.inclinometryChannel = inclinometryChannel;
  }

  public async loadCaratData(ids: WellID[], channelData: ChannelDict): Promise<ChannelRecordDict[]> {
    const flag = this.flag;
    const curveIDs: CaratCurveID[] = [];
    const caratData: ChannelRecordDict[] = [];
    const isTrace = ids.length > 1;
    const data = channelDictToRecords(channelData);

    for (const id of ids) {
      const [trackData, newCurveIDs] = this.getTrackData(id, data, isTrace);
      caratData.push(trackData);
      curveIDs.push(...newCurveIDs);
    }

    if (flag === this.flag) {
      await this.loadCurveData(curveIDs, true);
    }
    if (flag === this.flag && this.inclinometryChannel) {
      this.setLoading({status: 'inclinometry', statusOptions: null});
      const inclinometryChannel = channelData[this.inclinometryChannel.name];

      if (inclinometryChannel?.data) {
        const inclinometryInfo = this.inclinometryChannel.inclinometry;
        const mapper = (row) => this.loadInclinometry(row, inclinometryChannel);
        const recordList = await Promise.all(inclinometryChannel.data.rows.map(mapper));

        const inclinometryDataName = inclinometryInfo.name;
        const wellColumnName = inclinometryInfo.info.well.name;

        if (ids.length > 1) {
          for (const records of recordList) {
            if (records.length === 0) continue;
            const wellID = records[0][wellColumnName];
            const idx = ids.findIndex(i => i === wellID);
            if (idx !== -1) caratData[idx][inclinometryDataName] = records;
          }
        } else {
          caratData[0][inclinometryDataName] = recordList[0];
        }
      }
    }
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

  /** Загружает данные инклинометрии по скважине. */
  private async loadInclinometry(row: ChannelRow, channel: Channel): Promise<ChannelRecord[]> {
    const channelName = this.inclinometryChannel.inclinometry.name;
    const query: ChannelQuerySettings = {order: [], maxRowCount: null, filters: null};

    const parameter: Partial<Parameter> = {
      id: CaratLoader.inclinometryParameterID, type: 'tableRow',
      value: tableRowToString(channel, row),
    };

    const res = await channelsAPI.getChannelData(channelName, [parameter], query);
    const data = res.ok ? res.data.data : null;
    return data ? cellsToRecords(data) : [];
  }

  /** Дозагружает данные точек кривых. */
  public async loadCurveData(ids: CaratCurveID[], bySteps: boolean): Promise<CaratCurveID[]> {
    const idsToLoad: CaratCurveID[] = [...new Set(ids)].filter(id => !this.cache[id]);
    const total = idsToLoad.length;
    if (total === 0) return idsToLoad;

    const step = bySteps ? 5 : total;
    if (bySteps) {
      this.setLoading({percentage: 0, status: 'curves', statusOptions: {count: 0, total}});
    }

    const channelName = this.curveDataChannel.name;
    const query: ChannelQuerySettings = {order: [], maxRowCount: null, filters: null};

    for (let i = 0; i < total; i += step) {
      const slice = idsToLoad.slice(i, i + step);

      const parameter: Partial<Parameter> = {
        id: CaratLoader.curveDataParameterID, type: 'stringArray',
        value: slice.map(String),
      };

      const res = await channelsAPI.getChannelData(channelName, [parameter], query);
      const data = res.ok ? res.data.data : null;
      const records = cellsToRecords(data);
      const idColumnName = this.curveDataChannel.info.id.name;

      for (const id of idsToLoad) {
        const record = records.find(r => r[idColumnName] === id);
        if (record) {
          this.cache[id] = this.createCurveData(record);
        } else {
          this.cache[id] = {
            path: new Path2D(), points: [],
            top: null, bottom: null, min: null, max: null,
            order: ++this.curveCounter,
          };
        }
      }
      if (bySteps) {
        const count = i + slice.length;
        const percentage = count / (total + 1) * 100;
        this.setLoading({percentage, statusOptions: {count, total}});
      }
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
      order: ++this.curveCounter,
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

  /** Проверяет количество кривых в кеше и удаляет лишние кривые. */
  public checkCacheSize(): void {
    let entries = Object.entries(this.cache);
    if (entries.length <= CaratLoader.maxCacheCurveCount) return;

    entries.sort((a, b) => a[1].order - b[1].order);
    const idsToDelete = entries.map(entry => entry[0]).slice(CaratLoader.maxCacheCurveCount);

    for (const id of idsToDelete) {
      delete this.cache[id];
    }
  }
}
