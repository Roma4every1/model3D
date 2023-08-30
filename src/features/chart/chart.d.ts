/** Начальные настройки графика (запрос `/getFormSettings`). */
interface ChartFormSettings {
  /** Настройки внешнего вида. */
  seriesSettings: ChartSeriesSettings;
}

/** Состояние графиков. */
type ChartStates = Record<FormID, ChartState>;

/** Состояние формы графика.
 * + `tooltip: boolean`
 * + `dateStep`: {@link ChartDateStep}
 * + `seriesSettings`: {@link ChartSeriesSettings}
 * + `downloadChart: () => Promise`
 * */
interface ChartState {
  /** Нужно ли показывать окно со значениями. */
  tooltip: boolean;
  /** Шаг по времени. */
  dateStep: ChartDateStep;
  /** Настройки внешнего вида. */
  seriesSettings: ChartSeriesSettings;
  /** Функция для сохранения графика в png */
  downloadChart?: () => Promise<void>;
}

/** Шаг по времени на графике. */
type ChartDateStep = 'month' | 'year';

/* --- --- */

/** Настройки внешнего вида графика. */
type ChartSeriesSettings = Record<ChannelName, ChannelSeriesSettings>;

/** Настройки для отображения каждого канала. */
interface ChannelSeriesSettings {
  seriesSettings: SeriesSettings;
  axesSettings: AxesSettings;
  dateStep: string;
  gridStep: string;
  labelInterval: number;
  tickOrigin: string;
  xAxisFieldName: string;
  xAxisType: string;
}

type SeriesSettings = Record<string, SeriesSettingsItem>;
type AxesSettings = Record<string, AxisSettings>;

interface SeriesSettingsItem {
  yAxisId: string;
  typeCode: ChartTypeCode;
  color: string;
  showLabels: boolean;
  showLine: boolean;
  showPoint: boolean;
  pointFigureIndex: string;
  lineStyleIndex: string;
  sizeMultiplier: number;
  zIndex: number;
}

/** Настройки оси графика. */
interface AxisSettings {
  /** Расположение оси слева или справа. */
  location: string;
  /** Цвет оси. */
  color: string;
  /** Минимальное значение. */
  min: number | null;
  /** Максимальное значение. */
  max: number | null;
  /** Количество засечек. */
  tickCount: number;
  /** Прямое или обратное направление оси. */
  inverse: boolean;
  /** Подпись к оси. */
  displayName: string;
}

/** ## Типы отображения значений на графике.
 * + `gist` — гистограмма
 * + `gistStack` — гистограмма накопл.
 * + `area` — область
 * + `areaSpline` — сглаженная область
 * + `areaDiscr` — дискретная область
 * + `graph` — линия
 * + `graphSpline` — сглаженная линия
 * + `graphDiscr` — дискретная линия
 * + `point` — набор точек
 * + `vertical` — вертикальные линии
 * */
type ChartTypeCode = 'gist' | 'gistStack' | 'area' | 'areaSpline' | 'areaDiscr' |
  'graph' | 'graphSpline' | 'graphDiscr' | 'point' | 'vertical';
