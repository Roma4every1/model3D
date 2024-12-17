import { MapLayer } from '../lib/map-layer';


export interface MapExtraObjectConfig {
  /** Конфигурация слоя под объект. */
  layer: MapExtraObjectLayerConfig;
  /** Менеджер объекта. */
  provider: MapExtraObjectProvider;
}

/** Конфигурация слоя для дополнительного объекта карты. */
export interface MapExtraObjectLayerConfig {
  /** Название слоя для объекта. */
  displayName: string;
  /** Минимальный масштаб, при котором объект будет отображаться. */
  minScale: number;
  /** Максимальный масштаб, при котором объект будет отображаться. */
  maxScale: number;
  /** Видимость слоя; по умолчанию `true`. */
  visible?: boolean;
  /** Возможность настраивать слой на уровне пользователя; по умолчанию `true`. */
  customizable?: boolean;
}

/** Состояние дополнительного объекта карты. */
export interface MapExtraObjectState<T = any, P = T> {
  /** Идентификатор объекта. */
  readonly id: MapExtraObjectID;
  /** Слой, на котором рисуется объект. */
  readonly layer: MapLayer;
  /** Возможность настраивать слой на уровне пользователя. */
  readonly layerCustomizable: boolean;
  /** Менеджер объекта. */
  readonly provider: MapExtraObjectProvider<T, P>;
  /** Текущие граничные координаты объекта. */
  objectBounds: Bounds;
}

/** Менеджер дополнительного объекта на карте. */
export interface MapExtraObjectProvider<M = any, P = M> {
  /** Текущая модель объекта. */
  model: M | null;
  /** Метод для обновления модели. */
  setModel(payload: P): void;
  /** Метод для расчёта граничных координат. */
  computeBounds(): Bounds;
  /** Метод отрисовки объекта. */
  render(options: MapDrawOptions): void;
  /** Метод для расчёта вьюпорта объекта. */
  computeViewport?(canvas: HTMLCanvasElement, bounds: Bounds): MapViewport;
  /** Проверка на смену вьюпорта после обновления модели. */
  needChangeViewport?(oldModel: M | null, newModel: M): boolean;
}
