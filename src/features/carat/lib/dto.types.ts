import type { CaratMarkSettingsDTO } from './mark.types';


/** Инициализирующие настройки для каротажной формы. */
export interface CaratFormSettings {
  /** Идентификатор формы. */
  readonly id: FormID;
  /** Глобальные настройки диаграммы. */
  readonly settings: CaratGlobalSettingsDTO;
  /** Список колонок диаграммы. */
  readonly columns: CaratColumnDTO[];
}

/** Глобальные настройки каротажной диаграммы. */
export interface CaratGlobalSettingsDTO {
  /** Масштабирование колонок. */
  readonly scale: number;
  /** Название канала с пластами для выравнивания по активному пласту. */
  readonly strataChannelName?: ChannelName;
  /** Зоны распределения каротажных кривых. */
  readonly zones: CaratZone[];
}

/** Модель колонки каротажной диаграммы. */
export interface CaratColumnDTO {
  /** Идентификатор колонки. */
  id: string;
  /** Базовые настройки. */
  settings: CaratColumnSettings;
  /** Настройки горизонтальных осей для кривых. */
  xAxis?: CaratColumnXAxis;
  /** Настройки вертикальной оси колонки. */
  yAxis?: CaratColumnYAxis;
  /** Подключённые каналы. */
  channels: AttachedChannelDTO[];
  /** Выборки кривых. */
  selection?: CaratDataSelection;
  /** Граничные значения шкал кривых. */
  measures?: CaratCurveMeasure[];
  /** Настройки внешнего вида для отдельных свойств каналов. */
  properties: Record<ChannelName, CaratColumnProperties>;
  /** Настройки внешнего вида подписей по глубине. */
  marks?: CaratMarkSettingsDTO;
  /** Является ли колонка активной. */
  active?: boolean;
}

/** Модель колонки каротажной диаграммы. */
export type CaratColumnInit = Omit<CaratColumnDTO, 'channels'> & {
  channels: AttachedChannel<CaratChannelType>[]
};

/** Базовые настройки колонки. */
export interface CaratColumnSettings {
  /** Тип колонки. */
  type: CaratColumnType;
  /** Название колонки. */
  label: string;
  /** Ширина колонки в пикселях. */
  width: number;
  /** Порядковый номер колонки. */
  index: number;
  /** Цвет обводки колонки. */
  borderColor: string;
}

/** Тип колонки:
 * + `background` — "колонка трека", рисуется под всеми остальными на всю ширину
 * + `external` — корреляции
 * + `labels` — подписи элементов конструкции скважины
 * + `normal` — всё остальное
 * */
export type CaratColumnType = 'normal' | 'background' | 'external' | 'labels';

/** Граничные значения шкалы для кривой.
 * + `type`: {@link CaratCurveType}
 * + `min: number | null`
 * + `max: number | null`
 * */
export interface CaratCurveMeasure {
  /** Тип кривой. */
  type: CaratCurveType;
  /** Максимальное значение кривой. */
  min: number | null;
  /** Максимальное значение кривой. */
  max: number | null;
}

/** Выборка каротажных кривых для колонки. */
export interface CaratDataSelection {
  /** Типы кривых. */
  types: CaratCurveSelector[];
  /** Начальная дата. */
  start: string;
  /** Конечная дата. */
  end: string;
}

export interface CaratCurveSelector {
  expression: string;
  isSelected: boolean;
}

/** Настройки горизонтальных осей для кривых.
 * + `grid: boolean`
 * + `numberOfMarks: number`
 */
export interface CaratColumnXAxis {
  /** Показывать ли вертикальную сетку. */
  grid: boolean;
  /** Количество делений на оси. */
  numberOfMarks: number;
}

/** Настройки вертикальной оси колонки.
 * + `show: boolean`
 * + `step: number`
 * + `grid: boolean`
 * + `absMarks: boolean`
 * + `depthMarks: boolean`
 */
export interface CaratColumnYAxis {
  /** Показывать ли ось. */
  show: boolean;
  /** Шаг по оси. */
  step: number;
  /** Показывать ли горизонтальную сетку. */
  grid: boolean;
  /** Показывать ли значение абсолютной отметки. */
  absMarks: boolean;
  /** Показывать ли значение глубины. */
  depthMarks: boolean;
}

/** Словарь настроек отображения свойств канала. */
export type CaratColumnProperties = Record<string, CaratPropertySettings>;

/** Настройки отображения свойства канала в колонке. */
export interface CaratPropertySettings {
  /** Настройки отображения подписей. */
  text?: CaratTextPropertySettings;
  /** Показывать ли текст. */
  showText?: boolean;
  /** Настройки отображения гистограммы. */
  bar?: CaratBarPropertySettings;
  /** Показывать ли гистограмму. */
  showBar?: boolean;
}

/** Настройки отображения подписей для свойства канала. */
export interface CaratTextPropertySettings {
  /** Цвет текста. */
  color: ColorString;
  /** Фон текста. */
  backgroundColor: ColorString;
  /** Размер шрифта текста. */
  fontSize: number;
  /** Угол поворота текста. */
  angle: number;
}

/** Настройки отображения гистограммы для свойства канала. */
export interface CaratBarPropertySettings {
  /** Выравнивание гистограммы (`left`, `right`, `center`). */
  align: string;
  /** Цвет элементов во внутренней области. */
  color: string;
  /** Цвет фона внутренней области. */
  backgroundColor: string;
  /** Цвет внутренней границы. */
  borderColor: string;
  /** Толщина внутренней границы. */
  thickness: number;
  /** Цвет элементов во внешней области. */
  externalColor: string;
  /** Цвет внешней границы. */
  externalBorderColor?: string;
  /** Толщина внешней границы. */
  externalThickness: number;
}
