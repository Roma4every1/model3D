import { MapLayer } from './map-layer';


/** Конфигурация дополнительного объекта карты. */
export interface MapExtraObjectConfig<T = any> {
  /** Идентификатор объекта. */
  id: MapExtraObjectID;
  /** Конфиг слоя для объека. */
  layer: MapExtraObjectLayerConfig;
  /** Функция для расчёта граничных координат объекта. */
  bound: (model: T) => Bounds;
  /** Функция для отрисовки объекта. */
  render: (model: T, options: MapDrawOptions) => void;
  /** Функция для расчёта вьюпорта объекта. */
  viewport?: (payload: MapExtraObjectViewPayload) => MapViewport | undefined;
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
}

/** Состояние дополнительного объекта карты. */
export interface MapExtraObject<T = any> {
  /** Идентификатор объекта. */
  readonly id: MapExtraObjectID;
  /** Слой, на котором рисуется объект. */
  readonly layer: MapLayer;
  /** Функция для расчёта граничных координат объекта. */
  readonly bound: (model: T) => Bounds;
  /** Функция для отрисовки объекта. */
  readonly render: (model: T, options: MapDrawOptions) => void;
  /** Функция для расчёта вьюпорта объекта. */
  readonly viewport?: (payload: MapExtraObjectViewPayload) => MapViewport | undefined;
  /** Текущая модель объекта. */
  objectModel: T | null;
  /** Текущие граничные координаты объекта. */
  objectBounds: Bounds;
}

/** Данные для расчёта вьюпорта дополнительного объекта карты. */
export interface MapExtraObjectViewPayload<T = any> {
  /** Ссылка на холст карты. */
  readonly canvas: HTMLCanvasElement;
  /** Текущая модель объекта. */
  readonly objectModel: Readonly<T>;
  /** Текущие ограничивающие координаты объекта. */
  readonly objectBounds: Readonly<Bounds>;
  /** Ссылка на экземпляр сцены. */
  readonly stage: IMapStage;
}
