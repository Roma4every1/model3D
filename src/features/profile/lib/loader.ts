import {mapsAPI} from "../../map/lib/maps.api.ts";
import {types} from "../../map/drawer/map-drawer.js";
import {getInterpolatedFieldValue} from "../../map/lib/selecting-utils.ts";
import {groupBy} from "../../../shared/lib";
import {getPointsDistance2D, getPointsDistance3D, getTraceLines} from "./utils.ts";
import {PROFILE_X_STEP} from "./constants.ts";
import {cellsToRecords, channelAPI} from "../../../entities/channels";
import {ProfileInclinometry} from "./inclinometry.ts";
import {ProfileTrace} from "./trace.ts";
import {ProfilePlast} from "./plast.ts";

/** Класс, реализующий загрузку данных для профиля по трассе. */
export class ProfileLoader implements IProfileLoader {
  /** Флаг для преждевременной остановки загрузки. */
  public flag: number;
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public setLoading: (l: Partial<CaratLoading>) => void;

  /** Канал с устьевыми координатами. */
  private readonly topBaseMapsChannelName: string;
  /** Канал с устьевыми координатами. */
  private readonly ustCoordsChannelName: string;
  /** Канал с инклинометрией. */
  private readonly inclinometryChannelName: string;

  public wellInclRecords: ProfileInclMark[];
  public perfRecords: ChannelRecord[];
  public plInfoRecords: ProfileLitPiece[];

  /** Кеш данных профиля. */
  public cache: ProfileDataCache;

  constructor() {
    this.topBaseMapsChannelName = 'TopBaseMaps';
    this.ustCoordsChannelName = 'UstCoords';

    this.flag = 0;
    this.setLoading = () => {
    };
    this.cache = null;
  }

  /** Создаёт набор данных для построения профиля по трассе и данным канала. */
  public async loadProfileData(formID: FormID, trace: TraceModel, channels: ChannelDict) {
    if (!trace?.nodes?.length) return;

    const ustChannel: Channel = channels[this.ustCoordsChannelName];
    const ustPoints: UstPoint[] = ustChannel.data.rows.map(r => ({
      WELL_ID: r.Cells[0],
      x: r.Cells[2],
      y: -r.Cells[1]
    }));
    const nodesCoords = trace?.nodes?.map(n =>
      ustPoints.find(u => u.WELL_ID === n.id)
    );
    const traceLinesData = getTraceLines(nodesCoords, ustPoints, PROFILE_X_STEP);
    const additionalWells = traceLinesData.additionalWells;

    //
    const profileTrace = new ProfileTrace(trace, ustChannel);
    console.log('TRACE', profileTrace);
    //

    await this.loadAdditionalProfileChannels(nodesCoords, additionalWells);

    const topBaseMapsChannel = channels[this.topBaseMapsChannelName];

    const topBaseFieldsMap =
      await this.loadTopBaseFields(formID, topBaseMapsChannel);

    this.setLoading({percentage: 90, status: 'trace', statusOptions: null});

    const {interpolatedLinesMap, minY, maxY} =
      this.getInterpolatedLinesMap(topBaseFieldsMap, traceLinesData);

    const inclinometryDataMap = this.getInclDataMap(nodesCoords);

    const lithologyMap = groupBy<number, ProfileLitPiece>(
      this.plInfoRecords,
      el => el.PL_ID
    );

    //
    const plastsMap: Map<number, ProfilePlast> = new Map<number, ProfilePlast>();
    topBaseFieldsMap.forEach((value, key) => {
      plastsMap.set(key, new ProfilePlast(key, profileTrace.points, value));
    });
    console.log(plastsMap);
    //

    const lithologyPointsMap: ProfileLithologyPointsMap = new Map<number, ProfileLitPoint[]>
    interpolatedLinesMap.forEach((line, plastCode) => {
      const litPieces = lithologyMap.get(plastCode);
      const litPoints: ProfileLitPoint[] = [];
      line.borderLine.forEach(point => {
        for (let abs = point.topAbsMark; abs <= point.baseAbsMark ; abs++) {
          litPoints.push({
            distance: point.x,
            absMark: abs,
            lithology: null,
            // lithology: this.findNearestLithologyPiece(
            //   point.x, point.y, abs, litPieces, incl, inclinometryDataMap
            // )
          })
        }
      })
      lithologyPointsMap.set(plastCode, litPoints)
    })

    this.cache = {
      xAxisSettings: {
        xMin: 0,
        xMax: traceLinesData.distance,
        xDelta: traceLinesData.distance
      },
      yAxisSettings: {
        yMin: minY,
        yMax: maxY,
        yDelta: maxY - minY
      },
      inclinometryData: inclinometryDataMap,
      lithologyData: lithologyPointsMap,
      plastsLinesData: interpolatedLinesMap,
      plastsData: plastsMap
    } as ProfileDataCache;
  }

  private getInterpolatedLinesMap(topBaseFieldsMap: ProfileTopBaseFieldsMap, traceLinesData: TraceLinesData) {
    let maxY = -Infinity;
    let minY = Infinity;
    this.setLoading({percentage: 95, status: 'linesData', statusOptions: null});
    const interpolatedLinesMap: ProfilePlastDataMap = new Map<number, ProfilePlastData>;
    topBaseFieldsMap.forEach((group, plastName) => {
      const baseField = group.find(field => field.mapType === 'BASE');
      const topField = group.find(field => field.mapType === 'TOP');
      let maxThickness = 0;
      interpolatedLinesMap.set(plastName, ({borderLine: traceLinesData?.points?.map(p => {
        const baseAbsMark = getInterpolatedFieldValue(baseField.containerData, p);
        const topAbsMark = getInterpolatedFieldValue(topField.containerData, p);
        minY = Math.min(minY, baseAbsMark, topAbsMark);
        maxY = Math.max(maxY, baseAbsMark, topAbsMark);
        maxThickness = Math.max(maxThickness, Math.abs(topAbsMark - baseAbsMark))
        return {
          x: p.x,
          y: p.y,
          distance: p.distance,
          baseAbsMark,
          topAbsMark
        } as ProfileLinePoint;
      }) as ProfileLineData, maxThickness: maxThickness
      }))
    })
    minY = Math.floor(minY);
    maxY = Math.ceil(maxY);

    interpolatedLinesMap.forEach((d, k) => {
      console.log(`key: ${k} : ${d.maxThickness}`)
    })

    return {
      interpolatedLinesMap,
      minY,
      maxY
    }
  }

  /** Загружает данные контейнеров полей TOP и BASE карт. */
  private async loadTopBaseFields(formID: FormID, topBaseMapsChannel: Channel): Promise<ProfileTopBaseFieldsMap> {
    const topBaseMapsChannelData = topBaseMapsChannel.data.rows.map(r => r.Cells);

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

  private findNearestLithologyPiece(
    x: number, y: number, absValue: number,
    litPieces: ProfileLitPiece[],
    inclinometry: ProfileInclinometry,
    inclinometryDataMap: ProfileInclDataMap
  ) {
    let minDistance = Infinity;
    let nearestLitPiece: ProfileLitPiece = null;
    if (!litPieces) return null;

    for (let i = 0; i < litPieces.length; i++) {
      const depth = inclinometry.getDepth(litPieces[i].NWELL_ID, absValue);
      if (!depth) continue;

      const wellInclData = inclinometryDataMap.get(litPieces[i].NWELL_ID);
      const wellCoords = {x: wellInclData.ustX, y: wellInclData.ustY};
      const topDistance =
        getPointsDistance3D({x: x, y: y}, wellCoords, depth, litPieces[i].KROW);
      const baseDistance =
        getPointsDistance3D({x: x, y: y}, wellCoords, depth, litPieces[i].PODOSH);
      if (topDistance < minDistance) {
        minDistance = topDistance;
        nearestLitPiece = litPieces[i];
      }
      if (baseDistance < minDistance) {
        minDistance = baseDistance;
        nearestLitPiece = litPieces[i];
      }
    }
    return nearestLitPiece;
  }

  private async loadAdditionalProfileChannels(nodesCoords: UstPoint[], additionalWells: UstPoint[]) {
    const query: ChannelQuerySettings = {order: [], maxRowCount: 5000, filters: null};
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
        "value": [...nodesCoords, ...additionalWells].map(n => n.WELL_ID).join(',')
      },
      {
        "id": "wellCaratSource",
        "type": "string",
        "value": "1"
      }
    ];

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

  private getInclDataMap = (nodes: UstPoint[]) => {
    const incl = new ProfileInclinometry(this.wellInclRecords);
    const inclinometryDataMap: ProfileInclDataMap =
      new Map<number, ProfileWellIncl>();

    let currentUstDistance = 0;
    const traceFirstNode = nodes[0];
    let lastUstX = traceFirstNode.x;
    let lastUstY = traceFirstNode.y;

    nodes.forEach(n => {
      const nodeId = n.WELL_ID;
      const nodeIncl = incl.data.get(nodeId);

      const inclPoints = !nodeIncl ? null :
        nodeIncl.map(inclPoint => {
          const resultX = n.x + inclPoint.SHIFTX;
          const resultY = n.y + inclPoint.SHIFTY;
          return {
            id: nodeId,
            x: resultX,
            y: resultY,
            distance: currentUstDistance + getPointsDistance2D(
              {x: lastUstX, y: lastUstY},
              {x: resultX, y: resultY}
            ),
            absValue: Math.abs(inclPoint.ABSMARK),
            depth: inclPoint.DEPTH
          } as ProfileWellInclPoint;
        }).sort((a, b) => b.absValue - a.absValue);

      const ustDistance = currentUstDistance += getPointsDistance2D(
        {x: lastUstX, y: lastUstY},
        {x: n.x, y: n.y}
      )

      inclinometryDataMap.set(
        n.WELL_ID,
        {
          WELL_ID: n.WELL_ID,
          ustX: n.x,
          ustY: n.y,
          ustDistance,
          inclPoints
        }
      );

      lastUstX = n.x;
      lastUstY = n.y;
    })

    return inclinometryDataMap;
  }
}
