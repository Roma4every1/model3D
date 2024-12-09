/** DTO с информацией о карте. */
export interface MapInfo {
  /** Тег. */
  eTag: string;
  /** Идентификатор системы хранения. */
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

/** DTO с информацией о слое карты. */
export interface MapLayerInfo {
  /** Идентификатор слоя. */
  uid: string;
  /** Название слоя. */
  name: string;
  /** Путь в дереве слоёв, узлы отделяются через `\`. */
  group: string;
  /** Идентификатор контейнера, в котором находятся элементы. */
  container: string;
  /** Минимальный масштаб, при котором показывается слой: число или `INF`. */
  lowscale: string;
  /** Максимальный масштаб, при котором показывается слой: число или `INF`. */
  highscale: string;
  /** Флаг видимости по умолчанию. */
  visible: boolean;
  /** Ограничивающие координаты. */
  bounds: Bounds;
}
