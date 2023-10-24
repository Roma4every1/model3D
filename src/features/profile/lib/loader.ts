import {mapsAPI} from "../../map/lib/maps.api.ts";
import {types} from "../../map/drawer/map-drawer.js";
import {getInterpolatedFieldValue} from "../../map/lib/selecting-utils.ts";
import {groupBy} from "../../../shared/lib";
import {getTraceLines} from "./utils.ts";
import {PROFILE_X_STEP} from "./constants.ts";

/** Класс, реализующий загрузку данных для профиля по трассе. */
export class ProfileLoader implements IProfileLoader {
  /** Флаг для преждевременной остановки загрузки. */
  public flag: number;
  /** Функция для обновления состояния загрузки на уровне интерфейса. */
  public setLoading: (l: Partial<CaratLoading>) => void;

  /** Кеш данных профиля. */
  public cache: ProfileDataCache;

  constructor() {
    this.flag = 0;
    this.setLoading = () => {};
    this.cache = null;
  }

  /** Создаёт набор данных для построения профиля по трассе и данным канала. */
  public async loadProfileData(formID: FormID, trace: TraceModel, topBaseMapsChannel: Channel) {
    const topBaseMapsData = topBaseMapsChannel.data.rows.map(r => r.Cells)
    const topBaseMapsGroupedMap = groupBy(
      topBaseMapsData,
      (data: MapDataRaw) => data[2]
    );
    const topBaseMapsGroupedArray = Array.from(topBaseMapsGroupedMap.values());

    let count = 1;
    const total = topBaseMapsGroupedArray.length;
    this.setLoading({percentage: 0, status: 'fields', statusOptions: {count: 0, total: total*2}});
    const loadStep = 90 / total;
    const fieldsData: MapField[][] = await Promise.all(topBaseMapsGroupedArray.map(
      async (group) => await Promise.all(
        group.map(async (data) => {
          const mapId = data[0];
          return await this.loadMapFieldContainer(mapId, formID);
        })
      ).then((res) => {
        const currentPercentage = Math.floor(loadStep * count++);
        this.setLoading({
          percentage: currentPercentage,
          status: 'fields',
          statusOptions: {count: count*2, total: total*2}
        });
        return res;
      })
    ));

    this.setLoading({percentage: 90, status: 'trace', statusOptions: null});
    const traceLinesData = getTraceLines(trace?.nodes, PROFILE_X_STEP);
    let maxY = -Infinity;
    let minY = Infinity;

    this.setLoading({percentage: 95, status: 'linesData', statusOptions: null});
    const interpolatedLines = fieldsData.map(plast =>
      plast.map(field =>
        traceLinesData.points.map(
          p => {
            const interpolatedValue = getInterpolatedFieldValue(field, p);
            minY = Math.min(minY, interpolatedValue);
            maxY = Math.max(maxY, interpolatedValue);
            return {
              x: p.x,
              y: p.y,
              value: interpolatedValue
            };
          }
        )
      )
    )

    minY = Math.floor(minY);
    maxY = Math.ceil(maxY);

    this.cache = {
      xAxisSettings: {
        xMin: 0,
        xMax: traceLinesData.distance,
        xDelta: traceLinesData.distance
      },
      yAxisSettings: {
        yMin: minY,
        yMax: maxY,
        yDelta: maxY-minY
      },
      plastsLinesData: interpolatedLines
    };
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
}
