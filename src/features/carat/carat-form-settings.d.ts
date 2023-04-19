/** Инициализирующие настройки для каротажной формы. */
interface CaratFormSettings {
  /** Идентификатор формы. */
  id: FormID,
  /** Глобальные настройки диаграммы. */
  settings: CaratSettings,
  /** Список колонок диаграммы. */
  columns: CaratColumnInit[],
}

/** Глобальные настройки каротажной диаграммы. */
interface CaratSettings {
  /** Масштабирование колонок. */
  scale: number,
  /** Использовать статический масштаб или нет. */
  useStaticScale: boolean,
  /** Название канала с пластами для выравнивания по активному пласту. */
  strataChannelName: ChannelName | null,
  /** Зоны распределения каротажных кривых. */
  zones: CaratZone[],
}

/** Зона распределения каротажных кривых. */
interface CaratZone {
  /** Относительная ширина зоны. */
  relativeWidth: number | null,
  /** Типы кривых. */
  types: CaratCurveType[],
}

/* --- Carat Column --- */

/** Модель колонки каротажной диаграммы. */
interface CaratColumnInit {
  /** Идентификатор колонки. */
  id: string,
  /** Базовые настройки. */
  settings: CaratColumnSettings,
  /** Настройки горизонтальных осей для кривых. */
  xAxis: CaratColumnXAxis | null,
  /** Настройки вертикальной оси колонки. */
  yAxis: CaratColumnYAxis | null,
  /** Подключённые каналы. */
  channels: CaratColumnChannel[],
  /** Выборки кривых. */
  selection: CaratDataSelection | null,
  /** Граничные значения шкал кривых. */
  measures: CaratCurveMeasure[] | null,
  /** Настройки внешнего вида для отдельных свойств каналов. */
  properties: Record<ChannelName, CaratColumnProperties>,
  /** Является ли колонка активной. */
  active: boolean,
}

/** Базовые настройки колонки. */
interface CaratColumnSettings {
  /** Тип колонки. */
  type: CaratColumnType,
  /** Название колонки. */
  label: DisplayName,
  /** Ширина колонки в пикселях. */
  width: number,
  /** Порядковый номер колонки. */
  index: number,
}

/** Тип колонки: `background` для трека, `external` для корреляций, `normal` для всего остального. */
type CaratColumnType = 'normal' | 'background' | 'external';

/** Настройки горизонтальных осей для кривых. */
interface CaratColumnXAxis {
  /** Показывать ли вертикальную сетку. */
  grid: boolean,
  /** Количество делений на оси. */
  numberOfMarks: number,
}

/** Настройки вертикальной оси колонки. */
interface CaratColumnYAxis {
  /** Показывать ли ось. */
  show: boolean,
  /** Шаг по оси. */
  step: number,
  /** Показывать ли горизонтальную сетку. */
  grid: boolean,
  /** Показывать ли значение абсолютной отметки. */
  absMarks: boolean,
  /** Показывать ли значение глубины. */
  depthMarks: boolean,
}

/** Выборка каротажных кривых для колонки. */
interface CaratDataSelection {
  /** Типы кривых. */
  types: {expression: string, isSelected: boolean}[]
  /** Начальная дата. */
  start: string,
  /** Конечная дата. */
  end: string,
}

/** Граничные значения шкалы для кривой. */
interface CaratCurveMeasure {
  /** Тип кривой. */
  type: string,
  /** Максимальное значение кривой. */
  min: number | null,
  /** Максимальное значение кривой. */
  max: number | null,
}

/** Подключённый к колонке канал. */
interface CaratColumnChannel {
  /** Название канала. */
  name: ChannelName,
  /** Тип присоединения. */
  attachOption: AttachOptionType,
  /** Список исключений для свойств. */
  exclude: string[] | null,
}

/** Словарь настроек отображения свойств канала. */
type CaratColumnProperties = Record<string, CaratPropertySettings>;

/** Настройки отображения свойства канала в колонке. */
interface CaratPropertySettings {
  /** Настройки отображения подписей. */
  text: CaratTextPropertySettings | null,
  /** Показывать ли текст. */
  showText: boolean,
  /** Настройки отображения гистограммы. */
  bar: CaratBarPropertySettings | null,
  /** Показывать ли гистограмму. */
  showBar: boolean,
}

/** Настройки отображения подписей для свойства канала. */
interface CaratTextPropertySettings {
  /** Цвет текста. */
  color: ColorHEX,
  /** Фон текста. */
  backgroundColor: ColorHEX,
  /** Размер шрифта текста. */
  fontSize: number,
  /** Угол поворота текста. */
  angle: number,
}

/** Настройки отображения гистограммы для свойства канала. */
interface CaratBarPropertySettings {
  /** Выравнивание гистограммы. */
  align: 'left' | 'right' | 'center',
  /** Цвет внешней границы ячейки. */
  externalBorderColor: ColorHEX | null,
}
