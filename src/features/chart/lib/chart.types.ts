import type { ReactElement } from 'react';
import type { YAxisProps, LegendProps } from 'recharts';
import { ChartStage } from './chart-stage';


/** Состояние графика. */
export interface ChartState {
  /** Идентификатор формы. */
  readonly id: FormID;
  /** Идентификаторы используемых каналов. */
  readonly usedChannels: ChannelID[];
  /** Идентификаторы используемых каналов-справочников. */
  readonly usedLookups: ChannelID[];
  /** Глобальные настройки. */
  readonly global: ChartGlobalSettings;
  /** Класс сцены. */
  readonly stage: ChartStage;
  /** Функция экспорта графика в PNG. */
  getPng?: () => Promise<string>;
}

/** Глобальные настройки графика. */
export interface ChartGlobalSettings {
  /** Показывать значения при наведении. */
  showTooltip: boolean;
}

/** Модель вертикальной оси на графике. */
export interface ChartAxis {
  /** Идентификатор. */
  readonly id: ChartAxisID;
  /** Минимальное значение. */
  min: number | null;
  /** Максимальное значение. */
  max: number | null;
  /** Количество меток на оси. */
  tickCount: number | null;
  /** Тип масштаба оси. */
  scale: ChartAxisScale;
  /** Расположение оси. */
  location: ChartYAxisLocation;
  /** Цвет оси. */
  color: ColorString;
  /** Подпись на оси. */
  displayName: string;
  /** Направление оси. */
  inverse: boolean;
}

/** Модель отображаемого свойства на графике. */
export interface ChartProperty {
  /** Идентификатор свойства. */
  readonly id: ChartPropertyID;
  /** Соответствующий канал формы. */
  readonly channel: AttachedChannel;
  /** Свойство канала, отвечающее за X. */
  readonly xProperty: ChannelProperty;
  /** Свойство канала, отвечающее за Y. */
  readonly yProperty: ChannelProperty;
  /** Идентификатор оси. */
  readonly yAxisID: ChartAxisID;

  /** Название для интерфейса. */
  displayName: string;
  /** Тип отображения значений. */
  displayType: ChartDisplayType;
  /** Тип кривой. */
  curveType: ChartCurveType;
  /** Основной цвет. */
  color: ColorString;
  /** Паттерн штриховки линии. */
  lineDash: string | undefined;

  /** Настройки отображения точек. */
  dotOptions: ChartDotOptions;
  /** Функция для отрисовки точек. */
  dotRenderer: ChartDotRenderer;

  /** Показывать ли линию для области. */
  showLine: boolean;
  /** Показывать ли точки в узлах линии. */
  showPoints: boolean;
  /** Показывать ли подписи значений. */
  showLabels: boolean;

  /** Флаг видимости свойства. */
  visible: boolean;
  /** Если false, в текущем датасете нет даннхы для отображения. */
  empty: boolean;
}

/** Пропс элемента точечного графика. */
export interface ChartDotProps {
  /** Координата центра по X. */
  readonly cx: number;
  /** Координата центра по Y. */
  readonly cy: number;
  /** Цвет заливки. */
  readonly fill: ColorString;
}

/** Настройки отображения элементов точечного графика. */
export interface ChartDotOptions {
  /** Номер фигуры. */
  shape: number;
  /** Размер элемента. */
  size: number;
}

/** Функция для отрисовки элемента точечного графика. */
export type ChartDotRenderer = (props: ChartDotProps) => ReactElement;

/* --- --- */

/** Область определения оси на графике. */
export type ChartAxisDomain = YAxisProps['domain'];
/** Элемент легенды графика. */
export type ChartLegendItem = LegendProps['payload'][number];

/** Модель данных графика. */
export interface ChartData {
  /** Основные данные. */
  records: ChartDataRecord[];
  /** Вертикальные метки. */
  marks: ChartMark[];
}

/** Значение по X и соответствующие ему значения по Y. */
export type ChartDataRecord = Record<'x' | string, number | string>;

/** Модель вертикальная метки. */
export interface ChartMark {
  /** Координата X или категория. */
  x: ChartXKey;
  /** Массив подписей. */
  values: ChartMarkLabel[];
}

/** Подпись вертикальной метки. */
export interface ChartMarkLabel {
  /** Исходное свойство, от которого образована метка. */
  property: ChartProperty;
  /** Значение ячейки из датасета. */
  value: any;
  /** Текст метки. */
  summary: string;
  /** Текст в раскрытом состоянии. */
  details?: string;
  /** Флаг раскрытости. */
  expanded?: boolean;
}

/* --- --- */

/** Предустановленные настройки отображения свойства на графике. */
export interface ChartPreset {
  /** Название пресета. */
  label: string;
  /** Иконка (href). */
  icon: string;
  /** Тип отображения. */
  displayType: ChartDisplayType;
  /** Тип кривой. */
  curveType?: ChartCurveType;
}
