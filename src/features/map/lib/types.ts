/* --- Map API -- */

export interface MapInfo {
  /** Тег. */
  eTag: string;
  /** Владелец карты. */
  owner: string | null;
  /** Код карты. */
  mapCode: string;
  /** Название карты. */
  mapName: string;
  /** Код организации. */
  organization: string;
  /** Код объекта разработки. */
  objectCode: string;
  /** Название объекта разработки. */
  objectName: string;
  /** Код пласта. */
  plastCode: string;
  /** Название пласта. */
  plastName: string;
  /** Дата карты. */
  date: string;
  /** DTO слоёв. */
  layers: MapLayerInfo[];
  /** Название контейнера с именованными точками. */
  namedpoints: string;
}

export interface MapLayerInfo {
  uid: string;
  name: string;
  group: string;
  container: string;
  highscale: string;
  lowscale: string;
  visible: boolean;
  bounds: Bounds;
}
