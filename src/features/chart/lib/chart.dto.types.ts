/** DTO настроек графика. */
export interface ChartSettingsDTO {
  /** Данные плагинов `chartSeriesSettings`. */
  readonly seriesSettings?: Record<ChannelName, ChartChannelSettingsDTO>;
}

/** DTO плагина `chartSeriesSettings` заданного канала. */
export interface ChartChannelSettingsDTO {
  /** Тип оси X. */
  readonly xAxisType?: string | null;
  /** Свойство канала, отвечающее за X. */
  readonly xAxisFieldName?: string | null;
  /** Настройки осей. */
  readonly axesSettings?: Record<ChartAxisID, ChartAxisDTO> | null;
  /** Настройки свойств. */
  readonly seriesSettings?: Record<PropertyName, ChartPropertyDTO> | null;
  /** Шаг по времени, если ось X имет тип даты. */
  readonly dateStep?: string | null;

  /* --- ignored --- */
  readonly gridStep?: string | null;
  readonly tickOrigin?: string | null;
  readonly labelInterval?: number | null;
}

/** DTO настроек вертикальной оси графика. */
export interface ChartAxisDTO {
  /** Минимальное значение. */
  readonly min?: number | null;
  /** Максимальное значение. */
  readonly max?: number | null;
  /** Количество засечек. */
  readonly tickCount?: number | null;
  /** Тип оси: линейная или логарифмическая. */
  readonly scale?: string | null;
  /** Расположение: слева или справа. */
  readonly location?: string | null;
  /** Цвет оси. */
  readonly color?: string | null;
  /** Подпись к оси. */
  readonly displayName?: string | null;
  /** Направление: снизу вверх или сверху вниз. */
  readonly inverse?: boolean | null;
}

/** DTO настроек свойства графика. */
export interface ChartPropertyDTO {
  /** ID соответствующей вертикальной оси. */
  readonly yAxisId?: string | null;
  /** Тип отображения значений. */
  readonly typeCode?: string | null;
  /** Основной цвет элементов. */
  readonly color?: string | null;
  /** Показывать ли линию для области. */
  readonly showLine?: boolean | null;
  /** Показывать ли точки в узлах линии. */
  readonly showPoint?: boolean | null;
  /** Показывать ли подписи значений. */
  readonly showLabels?: boolean | null;
  /** Код штриховки линии. */
  readonly lineStyleIndex?: string | null;
  /** Код фигуры для точечного графика. */
  readonly pointFigureIndex?: string | null;
  /** Характерный размер элемента. */
  readonly sizeMultiplier?: number | null;
  /** Индекс порядка отрисовки. */
  readonly zIndex?: number | null;
}
