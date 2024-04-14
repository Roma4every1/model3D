import {mapsAPI} from "../../map/lib/maps.api.ts";
import {types} from "../../map/drawer/map-drawer.js";
import {groupBy} from "../../../shared/lib";
import {cellsToRecords, channelAPI} from "../../../entities/channels";
import {ProfileTrace} from "./trace.ts";
import {ProfilePlast} from "./plast.ts";

/** Класс, реализующий загрузку данных для профиля по трассе. */
export class ProfileLoader implements IProfileLoader {
  /** Флаг для преждевременной остановки загрузки. */
  public flag: number;
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public setLoading: (l: Partial<CaratLoading>) => void;

  /** Имя канала с данными доступных карт подошвы и кровли. */
  private readonly topBaseMapsChannelName: string  = 'TopBaseMaps';
  /** Имя канала с устьевыми координатами. */
  private readonly ustCoordsChannelName: string = 'UstCoords';

  /** Записы канала с икнлинометрией скважин. */
  public wellInclRecords: ProfileInclMark[];
  /** Записи канала с перформациями скважин. */
  public perfRecords: ChannelRecord[];
  /** Записи канала с пропластками. */
  public plInfoRecords: ProfileLitPiece[];

  /** Кеш данных профиля. */
  public cache: ProfileDataCache;

  constructor() {
    this.flag = 0;
    this.setLoading = () => {};
    this.cache = null;
  }

  /** Создаёт набор данных для построения профиля по трассе и данным канала. */
  public async loadProfileData(formID: FormID, trace: TraceModel, channels: ChannelDict) {
    if (!trace?.nodes?.length) return;

    // канал с устьевыми координатами скважин
    const ustChannel: Channel = channels[this.ustCoordsChannelName];

    // создание трассы профиля по устьевым координатам
    const profileTrace = new ProfileTrace(trace, ustChannel);

    // загрузка данных инлинометрии, перфораций и литологии
    await this.loadAdditionalProfileChannels(profileTrace.wells);

    // установка соответствующих записей пропластков (литологии) для каждой скважины
    profileTrace.wells.forEach(w => w.setLithologyPieces(this.plInfoRecords));

    // канал, содержащий все доступные карты кровли и подошвы по параметру месторождения
    const topBaseMapsChannel = channels[this.topBaseMapsChannelName];

    // загрузка контейнеров полей TOP и BASE для каждой доступной карты
    const topBaseFieldsMap =
      await this.loadTopBaseFields(formID, topBaseMapsChannel);

    this.setLoading({percentage: 90, status: 'trace', statusOptions: null});

    // создание объектов пластов профиля
    const plastsMap: ProfilePlastMap = new Map<number, ProfilePlast>();
    topBaseFieldsMap.forEach((value, key) => {
      plastsMap.set(key, new ProfilePlast(key, profileTrace.points, value));
    });

    this.cache = {
      plastsData: plastsMap
    } as ProfileDataCache;
  }

  /** Загружает данные контейнеров полей TOP и BASE карт. */
  private async loadTopBaseFields(
    formID: FormID,
    topBaseMapsChannel: Channel
  ): Promise<Map<number, TopBaseMapsDataRaw[]>> {

    const topBaseMapsChannelData = topBaseMapsChannel.data.rows;

    let count = 1;
    const total = topBaseMapsChannelData.length;
    this.setLoading({percentage: 0, status: 'fields', statusOptions: {count: 0, total: total}});
    const loadStep = 90 / total;

    const topBaseMapsData: TopBaseMapsDataRaw[] = await Promise.all(topBaseMapsChannelData.map(
      async data => {
        const mapId = data[0];
        const containerData = await this.loadMapFieldContainer(mapId, formID);
        const currentPercentage = Math.floor(loadStep * count++);
        this.setLoading({
          percentage: currentPercentage,
          status: 'fields',
          statusOptions: {count: count, total: total}
        });
        return {
          plastCode: parseInt(data[2]),
          mapType: data[1],
          containerData
        };
      }
    ));

    // группирует данные контейнеров по идентификатору пласта
    return groupBy<number, TopBaseMapsDataRaw>(
      topBaseMapsData,
      (data) => data.plastCode
    );
  }

  /** Загружает данные поля из контейнера по MapID карты. */
  private async loadMapFieldContainer(mapID: MapID, formID: FormID): Promise<MapField> {
    const mapRes = await mapsAPI.getMap(mapID, formID);
    const mapData = typeof mapRes.data === 'string' ?
      null :
      mapRes.data as MapDataRaw;

    if (!mapData) return null;
    const mapOwner = mapData.owner || 'Common';
    const layer = mapData.layers.find(l =>
      l.container.includes('Fields')
    );

    const data = await mapsAPI.getMapContainer(
      layer.container,
      mapOwner
    );

    if (typeof data === 'string') {
      return null;
    }

    const layerFromContainer = layer.uid.includes(layer.container)
      ? data.layers[layer.uid.replace(layer.container, '')]
      : data.layers[layer.uid];

    const element = layerFromContainer.elements[0];
    const t = types[element.type];
    if (t && t.loaded) await t.loaded(element);

    return element as MapField;
  }

  /** Загружает данные инлинометрии, перфораций и литологии (пропластков) для списка скважин. */
  private async loadAdditionalProfileChannels(wells: IProfileWell[]) {
    const query: ChannelQuerySettings = {order: [], maxRowCount: 5000, filters: null};

    // временные статичные значения параметров, т.к. параметр activeWells так или иначе
    // приходится задавать мануально
    const parameters: Partial<Parameter>[] = [
      {
        "id": "currentMest",
        "type": "tableRow",
        "value": "OPR##System.DBNull|LOOKUPCODE#195#System.Decimal|LOOKUPCODE#195#System.Decimal|LOOKUPPARENTCODE#81#System.Decimal|LOOKUPPARENTCODE#81#System.Decimal|LOOKUPVALUE#Абдрахмановская#System.String|LOOKUPVALUE#Абдрахмановская#System.String|OBJCODE#21#System.Int32|MS#1042#System.Int32|OBJNAME#10-1-911#System.String|CODE#1042#System.Decimal|PARENT_ID#1#System.Decimal|ID#121#System.Decimal|MEST#1021#System.Int32|ZP#1042#System.Int32"
      },
      {
        "id": "currentTpp",
        "type": "tableRow",
        "value": "ID#1#System.Decimal|LOOKUPCODE#1#System.Decimal|SCHEMA_NAME#dbmm_tat#System.String|SCHEMA_NAME#dbmm_tat#System.String|NAME#НГДУ\"Лениногорскнефть\"#System.String|LOOKUPVALUE#НГДУ\"Лениногорскнефть\"#System.String"
      },
      {
        "id": "activeWells",
        "type": "string",
        "value": wells.map(n => n.id).join(',')
      },
      {
        "id": "wellCaratSource",
        "type": "string",
        "value": "1"
      }
    ];

    // повторный запрос каналов, у которых есть параметр activeWells
    const wellInclChannel =
      await channelAPI.getChannelData('WellIncl', parameters, query);
    const wellInclChannelData = wellInclChannel.ok ? wellInclChannel.data.data : null;
    this.wellInclRecords = (wellInclChannelData ? cellsToRecords(wellInclChannelData) : []) as ProfileInclMark[]

    const perfChannel =
      await channelAPI.getChannelData('Perf', parameters, query);
    const perfChannelData = perfChannel.ok ? perfChannel.data.data : null;
    this.perfRecords = perfChannelData ? cellsToRecords(perfChannelData) : [];

    const plInfoChannel =
      await channelAPI.getChannelData('PlInfo', parameters, query);
    const plInfoChannelData = plInfoChannel.ok ? plInfoChannel.data.data : null;
    this.plInfoRecords = (plInfoChannelData ? cellsToRecords(plInfoChannelData) : []) as ProfileLitPiece[];
  }
}
