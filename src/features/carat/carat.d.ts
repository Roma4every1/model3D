/** Состояние загрузки данных каротажной диаграммы.
 * + `percentage: number`
 * + `status: string`
 * + `statusOptions?`: {@link I18nOptions}
 * */
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

/** Данные точек кривых.
 * + `path`: {@link Path2D}
 * + `points`: {@link Point}[]
 * + `top: number`
 * + `bottom: number`
 * + `min: number`
 * + `max: number`
 * */
interface CaratCurveData {
  /** Путь кривой. */
  path: Path2D;
  /** Набор точек кривой. */
  points: Point[];
  /** Начальная отметка глубины. */
  top: number;
  /** Конечная отметка глубины. */
  bottom: number;
  /** Минимальное значение кривой. */
  min: number;
  /** Максимальное значение кривой. */
  max: number;
  /** Порядок добавления в кеш (техническое поле). */
  order: number;
}

/** Настройки экспокрта каротажной диаграммы в PNG. */
interface CaratExportOptions {
  /** Начальная глубина. */
  startDepth: number;
  /** Конечная глубина. */
  endDepth: number;
  /** Оставлять ли прозрачный фон. */
  transparent?: boolean;
}

/** Инклинометрия скважины. */
interface ICaratInclinometry {
  getAbsMark(depth: number): number;
  getDepth(absMark: number): number;
}

interface ICaratColumn {
  rect: Rectangle;
  channel: AttachedChannel;

  copy(): ICaratColumn;
  getLookupNames(): ChannelName[];
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

/** Типы распознаваемых каналов, которые могут быть подключены к каротажной форме.
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
type CaratChannelType = 'lithology' | 'perforation' | 'curve' | 'curve-data' |
  'inclinometry' | 'bore' | 'image' | 'face' | 'vertical' | 'mark';
