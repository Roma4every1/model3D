import { firstItem } from 'shared/lib';
import { channelAPI, cellsToRecords } from 'entities/channel';
import { StringArrayParameter, TableRowParameter, rowToParameterValue, serializeParameter } from 'entities/parameter';


/** Класс, реализующий загрузку данных для построения каротажа по трассе. */
export class CaratLoader {
  /** Максимальное количество кривых в кеше. */
  public static readonly maxCacheSize = 64;
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

  public async loadCaratData(channels: ChannelDict): Promise<Map<WellID, ChannelRecordDict>> {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    try {
      const data = await this.loadData(channels);
      this.abortController = null;
      return data;
    } catch (e: any) {
      if (e instanceof DOMException) return; // aborted
      this.onProgressChange({percentage: -1, status: 'carat.loading.error'});
      this.abortController = null;
      return null;
    }
  }

  private async loadData(channels: ChannelDict): Promise<Map<WellID, ChannelRecordDict>> {
    const curveIDs: CaratCurveID[] = [];
    const caratData = new Map<WellID, ChannelRecordDict>();

    for (const { id, type, info } of this.attachedChannels) {
      const wellColumnName = info.well?.columnName;
      if (!wellColumnName || type === 'inclinometry') continue;

      const records = cellsToRecords(channels[id]?.data);
      const isCurveChannel = type == 'curve';

      for (const record of records) {
        const well = Number.parseInt(record[wellColumnName]);
        if (Number.isNaN(well)) continue;

        if (isCurveChannel && record[info.defaultLoading.columnName]) {
          curveIDs.push(record[info.id.columnName]);
        }
        let trackData = caratData.get(well);
        if (!trackData) { trackData = {}; caratData.set(well, trackData); }
        let trackRecords = trackData[id];
        if (!trackRecords) { trackRecords = []; trackData[id] = trackRecords; }
        trackRecords.push(record);
      }
    }

    if (curveIDs.length > 0) {
      if (this.separateCurveLoading) {
        await this.loadCurveData(curveIDs, true);
      } else {
        this.updateCache(curveIDs, channels);
      }
    }

    if (this.inclinometryChannel && caratData.size > 0) {
      const details = this.inclinometryChannel.info.inclinometry.details;
      const dataChannelID = details.id;
      const dataChannel = channels[dataChannelID];

      if (dataChannel.config.parameterNames[0] !== 'currentWellGeom') {
        const trackData = firstItem(caratData);
        if (trackData) trackData[dataChannelID] = cellsToRecords(dataChannel.data);
        return caratData;
      }
      const inclinometryChannel = channels[this.inclinometryChannel.id];
      const rows = inclinometryChannel?.data?.rows;
      if (!rows) return caratData;
      this.onProgressChange({status: 'carat.loading.inclinometry'});

      if (caratData.size === 1) {
        const trackData = firstItem(caratData);
        const value = rowToParameterValue(rows[0], inclinometryChannel);
        trackData[dataChannelID] = await this.loadInclinometry(value, dataChannel);
      } else {
        const recordList = await Promise.all(rows.map((row: ChannelRow) => {
          const value = rowToParameterValue(row, inclinometryChannel);
          return this.loadInclinometry(value, dataChannel);
        }));
        const wellColumnName = details.info.well.columnName;
        for (const records of recordList) {
          if (records.length === 0) continue;
          const trackData = caratData.get(records[0][wellColumnName]);
          trackData[dataChannelID] = records;
        }
      }
    }
    return caratData;
  }

  /** Обновляет кеш кривых на основе данных канала с точками. */
  private updateCache(ids: CaratCurveID[], channelDict: ChannelDict): void {
    const records = cellsToRecords(channelDict[this.curveDataChannel.id].data);
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
      const statusOptions = {count: 0, total: total};
      this.onProgressChange({percentage: 0, status: 'carat.loading.curves', statusOptions});
    }
    const channelName = this.curveDataChannel.name;
    const parameter = new StringArrayParameter(null, 'currentCurveIds', null);
    const signal = this.abortController?.signal;

    for (let i = 0; i < total; i += step) {
      const slice = idsToLoad.slice(i, i + step);
      parameter.setValue(slice.map(String));

      const payload = [serializeParameter(parameter)];
      const res = await channelAPI.getChannelData(channelName, payload, null, signal);

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

  /** Загружает данные инклинометрии по скважине. */
  private async loadInclinometry(value: TableRowValue, channel: Channel): Promise<ChannelRecord[]> {
    const parameter = new TableRowParameter(null, 'currentWellGeom', null);
    parameter.setValue(value);
    const payload = [serializeParameter(parameter)];

    const signal = this.abortController.signal;
    const res = await channelAPI.getChannelData(channel.name, payload, null, signal);
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
