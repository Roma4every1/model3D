/* --- Dock --- */

/** Настройки формы **Dock**.
 * + `dateChanging`: {@link DateChangingPlugin}
 * + `parameterGroups`: {@link ParameterGroup}[]
 * */
interface DockFormSettings {
  /** Плагин, добавляющий связь между параметром года и интервалом дат. */
  dateChanging: DateChangingPlugin | null,
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups: ParameterGroup[] | null,
}

interface ParameterGroup {
  code: string,
  displayName: string,
}
interface DateChangingPlugin {
  year: ParameterID,
  dateInterval: ParameterID,
  columnName: string | null,
}

/* --- Grid --- */

/** Настройки формы **Grid**.
 * + `multiMapChannel: string | null`
 * */
interface GridFormSettings {
  /** Название канала с картами, в случае если презентация это мультикарта. */
  multiMapChannel: string | null
  parametersGroups?: ParameterGroup[] | null,
}

/* --- DataSet --- */

/** Настройки формы **DataSet**. */
interface DataSetFormSettings {
  id: FormID,
  columns: DataSetColumnsSettings,
  attachedProperties: DataSetAttachedProperties,
}

interface DataSetAttachedProperties {
  attachOption: string,
  exclude: string[],
}

interface DataSetColumnsSettings {
  columnsSettings: DataSetColumnSettings[],
  frozenColumnCount: number,
  canUserFreezeColumns: boolean,
  isTableMode: boolean,
  alternate: boolean,
  alternateRowBackground: any
}

interface DataSetColumnSettings {
  channelPropertyName: string,
  displayName: string,
  headerBackground: string,
  headerForeground: string,
  background: string,
  foreground: string,
  typeFormat: any,
  width: number,
  isReadOnly: boolean,
  isHeaderRotated: boolean,
  hideIfEmpty: boolean,
  displayIndex: number,
  isVisible: boolean,
  isContainsSearchMode: boolean
}

/* --- Chart --- */

/** Настройки формы **Chart**.
 * + `tooltip: boolean`
 * + `dateStep`: {@link ChartDateStep}
 * + `seriesSettings`: {@link ChartSeriesSettings}
 * */
interface ChartFormSettings {
  /** Нужно ли показывать окно со значениями. */
  tooltip: boolean,
  /** Шаг по времени. */
  dateStep: ChartDateStep,
  /** Настройки внешнего вида. */
  seriesSettings: ChartSeriesSettings,
}

type ChartDateStep = 'month' | 'year';
type ChartSeriesSettings = Record<ChannelName, ChannelSeriesSettings>;

/** Настройки для отображения каждого канала. */
interface ChannelSeriesSettings {
  seriesSettings: SeriesSettings,
  axesSettings: AxesSettings,
  dateStep: string,
  gridStep: string,
  labelInterval: number,
  tickOrigin: string,
  xAxisFieldName: string,
  xAxisType: string,
}

type SeriesSettings = Record<string, SeriesSettingsItem>;
type AxesSettings = Record<string, AxisSettings>;

interface SeriesSettingsItem {
  yAxisId: string,
  typeCode: ChartTypeCode,
  color: string,
  showLabels: boolean,
  showLine: boolean,
  showPoint: boolean,
  pointFigureIndex: string,
  lineStyleIndex: string,
  sizeMultiplier: number,
  zIndex: number,
}

/** Настройки оси графика. */
interface AxisSettings {
  /** Расположение оси слева или справа. */
  location: string,
  /** Цвет оси. */
  color: string,
  /** Минимальное значение. */
  min: number | null,
  /** Максимальное значение. */
  max: number | null,
  /** Количество засечек. */
  tickCount: number,
  /** Прямое или обратное направление оси. */
  inverse: boolean,
  /** Подпись к оси. */
  displayName: string,
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
