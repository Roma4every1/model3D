// import {mapsAPI} from "../../map/lib/maps.api.ts";
// import {types} from "../../map/drawer/map-drawer.js";
// import {getInterpolatedFieldValue} from "../../map/lib/selecting-utils.ts";
// import {groupBy} from "../../../shared/lib";
// import {getPointsDistance2D, getPointsDistance3D, getTraceLines} from "./utils.ts";
// import {PROFILE_X_STEP} from "./constants.ts";
// import {cellsToRecords, channelAPI} from "../../../entities/channels";
// import {ProfileInclinometry} from "./inclinometry.ts";
//
// /** Класс, реализующий загрузку данных для профиля по трассе. */
// export class ProfileLoader implements IProfileLoader {
//   /** Флаг для преждевременной остановки загрузки. */
//   public flag: number;
//   /** Функция для обновления состояния загрузки на уровне интерфейса. */
//   public setLoading: (l: Partial<CaratLoading>) => void;
//
//   /** Канал с устьевыми координатами. */
//   private readonly topBaseMapsChannelName: string;
//   /** Канал с устьевыми координатами. */
//   private readonly ustCoordsChannelName: string;
//   /** Канал с инклинометрией. */
//   private readonly inclinometryChannelName: string;
//
//   public wellInclRecords: ProfileInclMark[];
//   public perfRecords: ChannelRecord[];
//   public plInfoRecords: ProfileLitPiece[];
//
//   /** Кеш данных профиля. */
//   public cache: ProfileDataCache;
//
//   constructor() {
//     this.topBaseMapsChannelName = 'TopBaseMaps';
//     this.ustCoordsChannelName = 'UstCoords';
//
//     this.flag = 0;
//     this.setLoading = () => {
//     };
//     this.cache = null;
//   }
//
//   /** Создаёт набор данных для построения профиля по трассе и данным канала. */
//   public async loadProfileData(formID: FormID, trace: TraceModel, channels: ChannelDict) {
//     await this.loadAdditionalProfileChannels(trace);
//
//     const ustChannel: Channel = channels[this.ustCoordsChannelName];
//     const topBaseMapsChannel = channels[this.topBaseMapsChannelName];
//
//     const topBaseFieldsMap =
//       await this.loadTopBaseFields(formID, topBaseMapsChannel);
//
//     this.setLoading({percentage: 90, status: 'trace', statusOptions: null});
//
//     const ustCoords = trace?.nodes?.map(n =>
//       ustChannel.data.rows.find(r => r.Cells[0] === n.id)
//     ).map(p => ({
//       WELL_ID: p.Cells[0],
//       x: p.Cells[2],
//       y: -p.Cells[1]
//     }));
//
//     const traceLinesData = getTraceLines(ustCoords, PROFILE_X_STEP);
//
//     const {interpolatedLinesMap, minY, maxY} =
//       this.getInterpolatedLinesMap(topBaseFieldsMap, traceLinesData);
//
//     const incl = new ProfileInclinometry(this.wellInclRecords, minY, maxY);
//     const inclinometyDataMap: ProfileInclDataMap =
//       new Map<number, ProfileWellIncl>();
//
//     let currentUstDistance = 0;
//     const traceFisrtNode = ustCoords[0];
//     let lastUstX = traceFisrtNode.x;
//     let lastUstY = traceFisrtNode.y;
//
//     ustCoords.forEach(n => {
//       const nodeId = n.WELL_ID;
//       const nodeIncl = incl.data.get(nodeId);
//
//       const inclPoints = !nodeIncl ? null :
//         nodeIncl.map(inclPoint => {
//           const resultX = n.x + inclPoint.SHIFTX;
//           const resultY = n.y + inclPoint.SHIFTY;
//           return {
//             id: nodeId,
//             x: resultX,
//             y: resultY,
//             distance: currentUstDistance + getPointsDistance2D(
//               {x: lastUstX, y: lastUstY},
//               {x: resultX, y: resultY}
//             ),
//             absValue: Math.abs(inclPoint.ABSMARK),
//             depth: inclPoint.DEPTH
//           } as ProfileWellInclPoint;
//         }).sort((a, b) => b.absValue - a.absValue);
//
//       const ustDistance = currentUstDistance += getPointsDistance2D(
//         {x: lastUstX, y: lastUstY},
//         {x: n.x, y: n.y}
//       )
//
//       inclinometyDataMap.set(
//         n.WELL_ID,
//         {
//           WELL_ID: n.WELL_ID,
//           ustX: n.x,
//           ustY: n.y,
//           ustDistance,
//           inclPoints
//         }
//       );
//
//       lastUstX = n.x;
//       lastUstY = n.y;
//     })
//
//     const lithologyMap = groupBy<number, ProfileLitPiece>(
//       this.plInfoRecords,
//       el => el.PL_ID
//     );
//
//     const lithologyPointsMap: ProfileLithologyPointsMap = new Map<number, ProfileLitPoint[]>
//     interpolatedLinesMap.forEach((line, plastCode) => {
//       const litPieces = lithologyMap.get(plastCode);
//       const litPoints: ProfileLitPoint[] = [];
//       line.forEach(point => {
//         for (let abs = point.topAbsMark; abs <= point.baseAbsMark ; abs++) {
//           litPoints.push({
//             distance: point.x,
//             absMark: abs,
//             lithology: this.findNearestLithologyPiece(
//               point.x, point.y, abs, litPieces, incl, inclinometyDataMap
//             )
//           })
//         }
//       })
//       lithologyPointsMap.set(plastCode, litPoints)
//     })
//
//     this.cache = {
//       xAxisSettings: {
//         xMin: 0,
//         xMax: traceLinesData.distance,
//         xDelta: traceLinesData.distance
//       },
//       yAxisSettings: {
//         yMin: minY,
//         yMax: maxY,
//         yDelta: maxY - minY
//       },
//       inclinometryData: inclinometyDataMap,
//       lithologyData: lithologyPointsMap,
//       plastsLinesData: interpolatedLinesMap
//     };
//   }
//
//   private getInterpolatedLinesMap(topBaseFieldsMap: ProfileTopBaseFieldsMap, traceLinesData) {
//     let maxY = -Infinity;
//     let minY = Infinity;
//     this.setLoading({percentage: 95, status: 'linesData', statusOptions: null});
//     const interpolatedLinesMap: ProfilePlastData = new Map<number, ProfileLineData>;
//     topBaseFieldsMap.forEach((group, plastName) => {
//       const baseField = group.find(field => field.mapType === 'BASE');
//       const topField = group.find(field => field.mapType === 'TOP');
//       interpolatedLinesMap.set(plastName, traceLinesData.points.map(p => {
//         const baseAbsMark = getInterpolatedFieldValue(baseField.containerData, p);
//         const topAbsMark = getInterpolatedFieldValue(topField.containerData, p);
//         minY = Math.min(minY, baseAbsMark, topAbsMark);
//         maxY = Math.max(maxY, baseAbsMark, topAbsMark);
//         return {
//           x: p.x,
//           y: p.y,
//           distance: p.distance,
//           baseAbsMark,
//           topAbsMark
//         } as ProfileLinePoint;
//       }))
//     })
//     minY = Math.floor(minY);
//     maxY = Math.ceil(maxY);
//
//     return {
//       interpolatedLinesMap,
//       minY,
//       maxY
//     }
//   }
//
//   /** Загружает данные контейнеров полей TOP и BASE карт. */
//   private async loadTopBaseFields(formID: FormID, topBaseMapsChannel: Channel): Promise<ProfileTopBaseFieldsMap> {
//     const topBaseMapsChannelData = topBaseMapsChannel.data.rows.map(r => r.Cells);
//
//     let count = 1;
//     const total = topBaseMapsChannelData.length;
//     this.setLoading({percentage: 0, status: 'fields', statusOptions: {count: 0, total: total}});
//     const loadStep = 90 / total;
//
//     const topBaseMapsData: TopBaseMapsDataRaw[] = await Promise.all(topBaseMapsChannelData.map(
//       async data => {
//         const mapId = data[0];
//         const containerData = await this.loadMapFieldContainer(mapId, formID);
//         const currentPercentage = Math.floor(loadStep * count++);
//         this.setLoading({
//           percentage: currentPercentage,
//           status: 'fields',
//           statusOptions: {count: count, total: total}
//         });
//         return {
//           plastCode: parseInt(data[2]),
//           mapType: data[1],
//           containerData
//         };
//       }
//     ));
//
//     return groupBy<number, TopBaseMapsDataRaw>(
//       topBaseMapsData,
//       (data) => data.plastCode
//     );
//   }
//
//   /** Загружает данные поля из контейнера по MapID карты. */
//   private async loadMapFieldContainer(mapID: MapID, formID: FormID): Promise<MapField> {
//     const mapRes = await mapsAPI.getMap(mapID, formID);
//     const mapData = typeof mapRes.data === 'string' ?
//       null :
//       mapRes.data as MapDataRaw;
//
//     if (!mapData) return null;
//     const mapOwner = mapData.owner || 'Common';
//     const layer = mapData.layers.find(l =>
//       l.container.includes('Fields')
//     );
//
//     const data = await mapsAPI.getMapContainer(
//       layer.container,
//       mapOwner
//     );
//
//     if (typeof data === 'string') {
//       return null;
//     }
//
//     const layerFromContainer = layer.uid.includes(layer.container)
//       ? data.layers[layer.uid.replace(layer.container, '')]
//       : data.layers[layer.uid];
//
//     const element = layerFromContainer.elements[0];
//     const t = types[element.type];
//     if (t && t.loaded) await t.loaded(element);
//
//     return element as MapField;
//   }
//
//   private findNearestLithologyPiece(
//     x: number, y: number, absValue: number,
//     litPieces: ProfileLitPiece[],
//     inclinometry: ProfileInclinometry,
//     inclinometryDataMap: ProfileInclDataMap
//   ) {
//     let minDistance = Infinity;
//     let nearestLitPiece: ProfileLitPiece = null;
//     if (!litPieces) return null;
//
//     for (let i = 0; i < litPieces.length; i++) {
//       const depth = inclinometry.getDepth(litPieces[i].NWELL_ID, absValue);
//       if (!depth) continue;
//
//       const wellInclData = inclinometryDataMap.get(litPieces[i].NWELL_ID);
//       const wellCoords = {x: wellInclData.ustX, y: wellInclData.ustY};
//       const topDistance =
//         getPointsDistance3D({x: x, y: y}, wellCoords, depth, litPieces[i].KROW);
//       const baseDistance =
//         getPointsDistance3D({x: x, y: y}, wellCoords, depth, litPieces[i].PODOSH);
//       if (topDistance < minDistance) {
//         minDistance = topDistance;
//         nearestLitPiece = litPieces[i];
//       }
//       if (baseDistance < minDistance) {
//         minDistance = baseDistance;
//         nearestLitPiece = litPieces[i];
//       }
//     }
//     return nearestLitPiece;
//   }
//
//   private async loadAdditionalProfileChannels(trace: TraceModel) {
//     const query: ChannelQuerySettings = {order: [], maxRowCount: 5000, filters: null};
//     const parameters: Partial<Parameter>[] = [
//       {
//         "id": "currentMest",
//         "type": "tableRow",
//         "value": "OPR##System.DBNull|LOOKUPCODE#195#System.Decimal|LOOKUPCODE#195#System.Decimal|LOOKUPPARENTCODE#81#System.Decimal|LOOKUPPARENTCODE#81#System.Decimal|LOOKUPVALUE#Абдрахмановская#System.String|LOOKUPVALUE#Абдрахмановская#System.String|OBJCODE#21#System.Int32|MS#1042#System.Int32|OBJNAME#10-1-911#System.String|CODE#1042#System.Decimal|PARENT_ID#1#System.Decimal|ID#121#System.Decimal|MEST#1021#System.Int32|ZP#1042#System.Int32"
//       },
//       {
//         "id": "currentTpp",
//         "type": "tableRow",
//         "value": "ID#1#System.Decimal|LOOKUPCODE#1#System.Decimal|SCHEMA_NAME#dbmm_tat#System.String|SCHEMA_NAME#dbmm_tat#System.String|NAME#НГДУ\"Лениногорскнефть\"#System.String|LOOKUPVALUE#НГДУ\"Лениногорскнефть\"#System.String"
//       },
//       {
//         "id": "activeWells",
//         "type": "string",
//         "value": trace?.nodes?.map(n => n.id).join(',')
//       },
//       {
//         "id": "wellCaratSource",
//         "type": "string",
//         "value": "1"
//       }
//     ];
//
//     const wellInclChannel =
//       await channelAPI.getChannelData('WellIncl', parameters, query);
//     const wellInclChannelData = wellInclChannel.ok ? wellInclChannel.data.data : null;
//     this.wellInclRecords = (wellInclChannelData ? cellsToRecords(wellInclChannelData) : []) as ProfileInclMark[]
//
//     const perfChannel =
//       await channelAPI.getChannelData('Perf', parameters, query);
//     const perfChannelData = perfChannel.ok ? perfChannel.data.data : null;
//     this.perfRecords = perfChannelData ? cellsToRecords(perfChannelData) : [];
//
//     const plInfoChannel =
//       await channelAPI.getChannelData('PlInfo', parameters, query);
//     const plInfoChannelData = plInfoChannel.ok ? plInfoChannel.data.data : null;
//     this.plInfoRecords = (plInfoChannelData ? cellsToRecords(plInfoChannelData) : []) as ProfileLitPiece[];
//   }
// }
