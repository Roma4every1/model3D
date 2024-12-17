import { MapLayer } from './map-layer';
import { MapStage } from './map-stage';
import { MapLoader } from '../loader/loader';


/** Состояние карты. */
export interface MapState {
  /** Идентификатор формы. */
  readonly id: FormID;
  /** Класс сцены. */
  readonly stage: MapStage;
  /** Загрузчик. */
  readonly loader: MapLoader;
  /** Класс для отслеживания изменения размеров холста. */
  readonly observer: ResizeObserver;
  /** Используемые каналы. */
  readonly usedChannels: ChannelID[];
  /** Специальные параметры, которые могут быть изменены от карты. */
  readonly usedParameters: Record<string, ParameterID>;
  /** Состояние редактирования; `null`, если карта нередактируемая. */
  edit?: MapEditState | null;
  /** Ссылка на холст. */
  canvas: MapCanvas;
  /** Владелец карты. */
  owner: MapStorageID;
  /** Идентификатор карты. */
  mapID: MapID;
  /** Состояние загрузки карты. */
  status: MapStatus;
}

/** Состояние редактирования карты. */
export interface MapEditState {
  /** `true`, если карта находится в режиме редактирования элемента */
  editing: boolean;
  /** `true`, если карта находится в режиме создания элемента. */
  creating: boolean;
  /** Открыто ли окно свойств элемента. */
  propertyWindowOpen: boolean;
  /** Открыта ли аттрибутивная таблица. */
  attrTableWindowOpen: boolean;
  /** Была ли карта изменена. */
  modified: boolean;
  /** Копия элемента в состоянии перед редактированием. */
  initElement?: MapElement;
}

/* --- Events --- */

/** Типы аргументов для событий сцены карты. */
export interface MapEventMap {
  /** Событие изменения режима. */
  'mode': MapModeID;
  /** Событие изменения активного слоя. */
  'active-layer': MapLayer;
  /** Событие изменения активного элемента. */
  'active-element': MapElement;
  /** Событие, после которого могли измениться границы или валидность активного элемента. */
  'element-change': MapElement;
}

/** Типы событий сцены карты. */
export type MapEventKind = keyof MapEventMap;
