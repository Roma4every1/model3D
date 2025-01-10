/** Состояние загрузки данных каротажной диаграммы. */
interface CaratLoading {
  /** Процент загрузки. */
  percentage: number;
  /** Статус загрузки. */
  status: string;
  /** Аргументы шаблона локали. */
  statusOptions?: I18nOptions;
}

/** Кеш точек кривых. */
type CurveDataCache = Record<CaratCurveID, CaratCurveData>;

/** Данные точек кривых. */
interface CaratCurveData {
  /** Путь кривой. */
  readonly path: Path2D;
  /** Набор точек кривой. */
  readonly points: Point[];
  /** Начальная отметка глубины. */
  readonly top: number;
  /** Конечная отметка глубины. */
  readonly bottom: number;
  /** Минимальное значение кривой. */
  readonly min: number;
  /** Максимальное значение кривой. */
  readonly max: number;
  /** Порядок добавления в кеш (техническое поле). */
  readonly order: number;
}

/** Настройки экспокрта каротажной диаграммы в PNG. */
interface CaratExportOptions {
  /** Начальная глубина. */
  startDepth: number | number[];
  /** Конечная глубина. */
  endDepth: number | number[];
  /** Оставлять ли прозрачный фон. */
  transparent?: boolean;
  /** Выбранный трек для экспорта; если не задан экспортируются все. */
  selectedTrack?: any; // CaratTrack
}

/** Инклинометрия скважины. */
interface ICaratInclinometry {
  getAbsMark(depth: number): number;
  getDepth(absMark: number): number;
}

interface ICaratColumn {
  rect: Rectangle;
  channel: AttachedChannel;
  visible: boolean;

  copy(): ICaratColumn;
  getLookups(): ChannelID[];
  getElements?(): any[];
  getRange(): [number, number];
  setChannelData(records: ChannelRecord[]): void;
  setLookupData(lookupData: ChannelRecordDict): void;
  render(): void;
}

/** Порт просмотра. */
interface CaratViewport {
  /** Текущая координата по Y. */
  y: number;
  /** Высота области просмотра. */
  height: number;
  /** Минимально возможная координата по Y. */
  min: number;
  /** Максимально возможная координата по Y. */
  max: number;
  /** Масштаб: количество пикселей в метре. */
  scale: number;
  /** Состояние прокрутки. */
  scroll: CaratViewportScroll;
}

/** Состояние прокрутки. */
interface CaratViewportScroll {
  /** Очередь движений. */
  queue: number[];
  /** Направление движения. */
  direction: number;
  /** Шаг смещения за единицу прокрутки. */
  step: number;
  /** ID из `setInterval`. */
  id: number | null;
}

/** Идентификатор каротажной кривой. */
type CaratCurveID = number;
/** Тип каротажной кривой. */
type CaratCurveType = string;

/** Зона распределения каротажных кривых. */
interface CaratZone {
  /** Относительная ширина зоны. */
  relativeWidth?: number;
  /** Типы кривых. */
  types: CaratCurveType[];
}

/**
 * Типы распознаваемых каналов, которые могут быть подключены к каротажной форме.
 * + `inclinometry` — инклинометрия скважины
 * + `lithology` — литологические пласты
 * + `perforation` — перфорации
 * + `curve` — каротажные кривые
 * + `curve-data` — точки кривых
 * + `mark` — подписи по глубине
 * + `bore` (конструкция) — элементы ствола скважины
 * + `image` (конструкция) — изображения по глубине
 * + `face` (конструкция) — забои скважины
 * + `vertical` (конструкция) — вертикальная линия
 */
type CaratChannelType =
  | 'inclinometry' | 'lithology' | 'perforation' | 'curve' | 'curve-data'
  | 'mark' | 'bore' | 'image' | 'face' | 'vertical';
