/** Инициализирующие настройки для каротажной формы. */
interface CaratFormSettings {
  /** Идентификатор формы. */
  id: FormID;
  /** Глобальные настройки диаграммы. */
  settings: CaratSettings;
  /** Список колонок диаграммы. */
  columns: CaratColumnInit[];
}

/** Глобальные настройки каротажной диаграммы. */
interface CaratSettings {
  /** Масштабирование колонок. */
  scale: number;
  /** Использовать статический масштаб или нет. */
  useStaticScale: boolean;
  /** Название канала с пластами для выравнивания по активному пласту. */
  strataChannelName: ChannelName | null;
  /** Зоны распределения каротажных кривых. */
  zones: CaratZone[];
}

/** Зона распределения каротажных кривых. */
interface CaratZone {
  /** Относительная ширина зоны. */
  relativeWidth?: number;
  /** Типы кривых. */
  types: CaratCurveType[];
}

/* --- Carat Column --- */

/** Модель колонки каротажной диаграммы. */
interface CaratColumnInit {
  /** Идентификатор колонки. */
  id: string;
  /** Базовые настройки. */
  settings: CaratColumnSettings;
  /** Настройки горизонтальных осей для кривых. */
  xAxis: CaratColumnXAxis | null;
  /** Настройки вертикальной оси колонки. */
  yAxis: CaratColumnYAxis | null;
  /** Подключённые каналы. */
  channels: CaratAttachedChannel[];
  /** Выборки кривых. */
  selection: CaratDataSelection | null;
  /** Граничные значения шкал кривых. */
  measures: CaratCurveMeasure[] | null;
  /** Настройки внешнего вида для отдельных свойств каналов. */
  properties: Record<ChannelName, CaratColumnProperties>;
  /** Является ли колонка активной. */
  active: boolean;
}

/** Базовые настройки колонки. */
interface CaratColumnSettings {
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
type CaratColumnType = 'normal' | 'background' | 'external' | 'labels';

/** Настройки горизонтальных осей для кривых.
 * + `grid: boolean`
 * + `numberOfMarks: number`
 * */
interface CaratColumnXAxis {
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
 * */
interface CaratColumnYAxis {
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

/** Выборка каротажных кривых для колонки. */
interface CaratDataSelection {
  /** Типы кривых. */
  types: CaratCurveSelector[];
  /** Начальная дата. */
  start: string;
  /** Конечная дата. */
  end: string;
}

interface CaratCurveSelector {
  expression: string;
  isSelected: boolean;
}

/** Граничные значения шкалы для кривой.
 * + `type`: {@link CaratCurveType}
 * + `min: number | null`
 * + `max: number | null`
 * */
interface CaratCurveMeasure {
  /** Тип кривой. */
  type: CaratCurveType;
  /** Максимальное значение кривой. */
  min: number | null;
  /** Максимальное значение кривой. */
  max: number | null;
}

/** Подключённый к колонке канал. */
interface CaratAttachedChannel {
  /** Название канала. */
  name: ChannelName;
  /** Тип присоединения. */
  attachOption: AttachOptionType;
  /** Список исключений для свойств. */
  exclude: string[] | null;

  /** Тип подключённого канала. */
  type?: CaratChannelType;
  /** Список подключённых свойств. */
  properties?: ChannelProperty[];
  /** Индексы колонок. */
  info?: CaratChannelInfo;
  /** Информация о канале с инклинометрией. */
  inclinometry?: CaratAttachedLookup;
  /** Название справочника цветов кривых. */
  curveColorLookup?: CaratAttachedLookup;
  /** Информация о справочниках цветов и текста пропластков. */
  styles?: CaratStyleLookup[];
  /** Справочник с названиями пластов. */
  namesChannel?: ChannelName;
  imageLookup?: CaratAttachedLookup;
}

/** Информация о справочнике цветов и текста пропластков. */
interface CaratStyleLookup {
  columnName: string;
  color: CaratAttachedLookup;
  text: CaratAttachedLookup;
}

/** Справочник, подключённый к каналу каротажной колонки. */
interface CaratAttachedLookup {
  name: ChannelName;
  info: CaratChannelInfo;
  dict: Record<number, any>;
}

/** Словарь настроек отображения свойств канала. */
type CaratColumnProperties = Record<string, CaratPropertySettings>;

/** Настройки отображения свойства канала в колонке. */
interface CaratPropertySettings {
  /** Настройки отображения подписей. */
  text: CaratTextPropertySettings | null;
  /** Показывать ли текст. */
  showText: boolean;
  /** Настройки отображения гистограммы. */
  bar: CaratBarPropertySettings | null;
  /** Показывать ли гистограмму. */
  showBar: boolean;
}

/** Настройки отображения подписей для свойства канала. */
interface CaratTextPropertySettings {
  /** Цвет текста. */
  color: ColorHEX;
  /** Фон текста. */
  backgroundColor: ColorHEX;
  /** Размер шрифта текста. */
  fontSize: number;
  /** Угол поворота текста. */
  angle: number;
}

/** Настройки отображения гистограммы для свойства канала. */
interface CaratBarPropertySettings {
  /** Выравнивание гистограммы. */
  align: 'left' | 'right' | 'center';
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
  externalBorderColor: ColorHEX | null;
  /** Толщина внешней границы. */
  externalThickness: number;
}
