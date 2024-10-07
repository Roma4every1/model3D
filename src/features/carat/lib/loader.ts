import { StringArrayParameter, TableRowParameter, rowToParameterValue } from 'entities/parameter';
import { cellsToRecords, channelAPI } from 'entities/channel';


/** Класс, реализующий загрузку данных для построения каротажа по трассе. */
export class CaratLoader {
  /** Максимальное количество кривых в кеше. */
  public static readonly maxCacheSize = 50;
  /** Кеш точек кривых. */
  public readonly cache: CurveDataCache;
  /** Если true, кривые загружаются отдельно через специальный параметр канала. */
  public readonly separateCurveLoading: boolean;
  /** Счётчик добавления кривых. */
  private curveCounter: number;

  /** Каналы, необходимые для треков. */
  private readonly attachedChannels: AttachedChannel[];
  /** Канал с точками привых. */
  private readonly curveDataChannel: AttachedChannel;
  /** Канал с инклинометрией. */
  private readonly inclinometryChannel: AttachedChannel;

  /** Контроллер прерывания. */
  private abortController: AbortController;
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public onProgressChange: (l: Partial<CaratLoading>) => void;

  constructor(channels: AttachedChannel[], separateCurveLoading: boolean) {
    this.onProgressChange = () => {};
    this.cache = {};
    this.separateCurveLoading = separateCurveLoading;
    this.curveCounter = 0;

    this.attachedChannels = channels;
    this.curveDataChannel = channels.find(c => c.type === 'curve-data');
    this.inclinometryChannel = channels.find(c => c.type === 'inclinometry');
  }

  /** Создаёт набор данных для каждого трека по ID скважин и данным канала. */
  public async loadCaratData(ids: WellID[], channelData: ChannelDict): Promise<ChannelRecordDict[]> {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    const cbCatch = (e: Error) => {
      if (e instanceof DOMException) return null; // aborted
      this.onProgressChange({percentage: -1, status: 'carat.loading.error'});
      this.abortController = null;
      return null;
    };
    const cbThen = (data: ChannelRecordDict[]) => {
      this.abortController = null;
      return data;
    };
    return this.loadData(ids, channelData).then(cbThen).catch(cbCatch);
  }

  private async loadData(ids: WellID[], channelData: ChannelDict): Promise<ChannelRecordDict[]> {
    const data: ChannelRecordDict = {};
    const caratData: ChannelRecordDict[] = [];

    for (const attachedChannel of this.attachedChannels) {
      const id = attachedChannel.id;
      data[id] = cellsToRecords(channelData[id]?.data);
    }

    const curveIDs: CaratCurveID[] = [];
    const isTrace = ids.length > 1;

    for (const id of ids) {
      const [trackData, newCurveIDs] = this.getTrackData(id, data, isTrace);
      caratData.push(trackData);
      curveIDs.push(...newCurveIDs);
    }
    if (this.separateCurveLoading) {
      await this.loadCurveData(curveIDs, true);
    } else {
      this.updateCache(curveIDs, data);
    }

    if (this.inclinometryChannel) {
      const details = this.inclinometryChannel.info.inclinometry.details;
      const inclinometryDataID = details.id;
      const dataChannel = channelData[inclinometryDataID];

      if (dataChannel.config.parameterNames[0] !== 'currentWellGeom') {
        caratData[0][inclinometryDataID] = cellsToRecords(dataChannel.data);
        return caratData;
      }
      const inclinometryChannel = channelData[this.inclinometryChannel.id];
      const rows = inclinometryChannel?.data?.rows;
      if (!rows) return caratData;

      this.onProgressChange({status: 'carat.loading.inclinometry', statusOptions: null});
      const wellColumnName = details.info.well.columnName;

      const recordList = await Promise.all(rows.map((row: ChannelRow) => {
        const value = rowToParameterValue(row, inclinometryChannel);
        return this.loadInclinometry(value, dataChannel);
      }));

      if (ids.length > 1) {
        for (const records of recordList) {
          if (records.length === 0) continue;
          const wellID = records[0][wellColumnName];
          const idx = ids.findIndex(i => i === wellID);
          if (idx !== -1) caratData[idx][inclinometryDataID] = records;
        }
      } else {
        caratData[0][inclinometryDataID] = recordList[0];
      }
    }
    return caratData;
  }

  /** Обновляет кеш кривых на основе данных канала с точками. */
  public updateCache(ids: CaratCurveID[], data: ChannelRecordDict): void {
    const records = data[this.curveDataChannel.id];
    if (!records) return;
    const idColumnName = this.curveDataChannel.info.id.columnName;

    for (const id of ids) {
      const record = records.find(r => r[idColumnName] === id);
      this.cacheCurve(id, record);
    }
  }

  /** Загружает данные точек кривых и кладёт их в кеш. */
  public async loadCurveData(ids: CaratCurveID[], bySteps: boolean): Promise<CaratCurveID[]> {
    const idsToLoad: CaratCurveID[] = [...new Set(ids)].filter(id => !this.cache[id]);
    const total = idsToLoad.length;
    if (total === 0) return idsToLoad;

    const step = bySteps ? 5 : total;
    if (bySteps) {
      const status = 'carat.loading.curves';
      this.onProgressChange({percentage: 0, status, statusOptions: {count: 0, total}});
    }
    const channelName = this.curveDataChannel.name;
    const parameter = new StringArrayParameter(null, 'currentCurveIds', null);
    const signal = this.abortController?.signal;

    for (let i = 0; i < total; i += step) {
      const slice = idsToLoad.slice(i, i + step);

      parameter.setValue(slice.map(String));
      const res = await channelAPI.getChannelData(channelName, [parameter], null, signal);

      const data = res.ok ? res.data : null;
      const records = cellsToRecords(data);
      const idColumnName = this.curveDataChannel.info.id.columnName;

      for (const id of slice) {
        const record = records.find(r => r[idColumnName] === id);
        this.cacheCurve(id, record);
      }
      if (bySteps) {
        const count = i + slice.length;
        const percentage = count / (total + 1) * 100;
        this.onProgressChange({percentage, statusOptions: {count, total}});
      }
    }
    return idsToLoad;
  }

  /** Создаёт данные для трека по ID скважины. */
  private getTrackData(id: WellID, data: ChannelRecordDict, isTrace: boolean): [ChannelRecordDict, CaratCurveID[]] {
    const dict: ChannelRecordDict = {};
    const curveIDs: CaratCurveID[] = [];

    for (const channelID in data) {
      const attachment = this.attachedChannels.find(a => a.id.toString() === channelID);
      let records = data[channelID];
      if (!records) { dict[channelID] = []; continue; }

      if (isTrace && records.length) {
        const wellColumnName = attachment.info.well.columnName;
        records = records.filter(row => row[wellColumnName] === id);
      }

      if (attachment.type === 'curve') {
        const idName = attachment.info.id.columnName;
        const loadingName = attachment.info.defaultLoading.columnName;
        const defaultCurves = records.filter(record => Boolean(record[loadingName]));
        curveIDs.push(...defaultCurves.map(record => record[idName]));
      }
      dict[channelID] = records;
    }
    return [dict, curveIDs] as [ChannelRecordDict, CaratCurveID[]];
  }

  /** Загружает данные инклинометрии по скважине. */
  private async loadInclinometry(value: any, channel: Channel): Promise<ChannelRecord[]> {
    const parameter = new TableRowParameter(null, 'currentWellGeom', null);
    parameter.setValue(value);

    const signal = this.abortController.signal;
    const res = await channelAPI.getChannelData(channel.name, [parameter], null, signal);
    return res.ok ? cellsToRecords(res.data) : [];
  }

  /** Сохраняет кривую в кеш. */
  private cacheCurve(id: CaratCurveID, record: ChannelRecord): void {
    let data: CaratCurveData;
    if (record) data = this.createCurveData(record);

    if (!data) data = {
      path: new Path2D(), points: [],
      top: 0, bottom: 0, min: 0, max: 0,
      order: ++this.curveCounter,
    };
    this.cache[id] = data;
  }

  /** Создаёт модель данных кривой. */
  private createCurveData(record: ChannelRecord): CaratCurveData | null {
    const info = this.curveDataChannel.info;
    const pathData = record[info.data.columnName];
    if (!pathData) return null;

    const svgPath = window.atob(pathData); // Mx,yLx,yLx,y...
    const pathItems = svgPath.split('L');
    if (pathItems.length < 2) return null;

    let top = Infinity, bottom = -Infinity;
    pathItems[0] = pathItems[0].substring(1);

    const points = pathItems.map((item: string): Point => {
      const sepIndex = item.indexOf(',');
      const x = parseFloat(item.substring(0, sepIndex));
      const y = parseFloat(item.substring(sepIndex + 1));

      if (y < top) top = y;
      if (y > bottom) bottom = y;
      return {x, y};
    });

    return {
      path: new Path2D(svgPath),
      points, top, bottom,
      min: record[info.min.columnName],
      max: record[info.max.columnName],
      order: ++this.curveCounter,
    };
  }

  /** Проверяет количество кривых в кеше и удаляет лишние кривые. */
  public checkCacheSize(): void {
    const entries = Object.entries(this.cache);
    if (entries.length <= CaratLoader.maxCacheSize) return;

    entries.sort((a, b) => b[1].order - a[1].order);
    const idsToDelete = entries.map(entry => entry[0]).slice(CaratLoader.maxCacheSize);
    for (const id of idsToDelete) delete this.cache[id];
  }
}
