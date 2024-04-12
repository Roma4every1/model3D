/** Хранилище каротажных диаграмм. */
type CaratStates = FormDict<CaratState>;

/** Состояние каротажной формы.
 * + `canvas`: {@link HTMLCanvasElement}
 * + `stage`: {@link ICaratStage}
 * + `loader`: {@link ICaratLoader}
 * + `observer`: {@link ResizeObserver}
 * + `lookupNames`: {@link ChannelName}[]
 * + `lastData`: {@link ChannelDict}[]
 * */
interface CaratState {
  /** Ссылка на холст. */
  canvas: HTMLCanvasElement;
  /** Экземпляр класса сцены. */
  stage: ICaratStage;
  /** Класс, реализующий загрузку данных для построения каротажа по трассе. */
  loader: ICaratLoader;
  /** Класс для отслеживания изменения размеров холста. */
  observer: ResizeObserver;
  /** Список всех используемых каналов. */
  channelNames: ChannelName[];
  /** Список всех названий каналов-справочников. */
  lookupNames: ChannelName[];
  /** Находится ли форма в состоянии загрузки. */
  loading: CaratLoading;
}

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

/** Загрузчик данных для построения каротажа по трассе. */
interface ICaratLoader {
  flag: number;
  cache: CurveDataCache;
  setLoading: (l: Partial<CaratLoading>) => void;

  loadCaratData(ids: WellID[], channelData: ChannelDict): Promise<ChannelRecordDict[]>;
  loadCurveData(ids: CaratCurveID[], bySteps: boolean): Promise<CaratCurveID[]>;
  checkCacheSize(): void;
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

/* --- --- */

/** Сцена каротажной диаграммы. */
interface ICaratStage {
  wellIDs: WellID[];
  trackList: ICaratTrack[];
  correlations: ICaratCorrelations;
  listeners: CaratStageListeners;
  actualLookup: boolean;

  getZones(): CaratZone[];
  getCaratSettings(): CaratSettings;
  getActiveTrack(): ICaratTrack;

  setCanvas(canvas: HTMLCanvasElement): void;
  setTrackList(wells: WellModel[]): void;
  setActiveTrack(idx: number): void;
  setZones(zones: CaratZone[]): void;
  edit(action: StageEditAction): void;

  alignByStratum(id: StratumID): void;
  gotoStratum(id: StratumID, toTop: boolean): void;

  setData(data: ChannelRecordDict[], cache: CurveDataCache): void;
  setLookupData(lookupData: ChannelRecordDict): Promise<void>;

  handleKeyDown(key: string): boolean;
  handleMouseMove(point: Point, by: number): void;
  handleMouseDown(point: Point): void;
  handleMouseWheel(point: Point, direction: 1 | -1, ctrlKey: boolean): void;

  updateTrackRects(): void;
  resize(): void;

  renderImage(options: CaratExportOptions): HTMLCanvasElement;
  render(): void;
  lazyRender(index: number): void;
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

type StageEditAction =
  PayloadAction<'scale', number> |
  PayloadAction<'move', {idx: number, to: 'left' | 'right'}> |
  PayloadAction<'active-group', number> |
  PayloadAction<'group-width', {idx: number, width: number}> |
  PayloadAction<'group-label', {idx: number, label: string}> |
  PayloadAction<'group-x-axis', {idx: number, settings: CaratColumnXAxis}> |
  PayloadAction<'group-y-axis', {idx: number, settings: CaratColumnYAxis}> |
  PayloadAction<'group-y-step', {idx: number, step: number}>;

interface ICaratCorrelations {
  getInit(): CaratColumnInit;
  getWidth(): number;
  render(index?: number): void;
}

/** Слушатели событий сцены. */
interface CaratStageListeners {
  /** Изменение масштаба. */
  scaleChange(scale: number): void;
  /** Изменение колонки с кривыми. */
  trackPanelChange(): void;
  /** Изменение активной колонки. */
  caratPanelChange(): void;
  /** Обновление окна выбора кривых. */
  curveWindowChange(): void;
}

/** Трек каротажной диаграммы. */
interface ICaratTrack {
  wellName: WellName;
  constructionMode: boolean;
  readonly rect: BoundingRect;
  readonly viewport: CaratViewport;
  readonly inclinometry: ICaratInclinometry;
  readonly transformer: IConstructionTransformer;

  getGroups(): ICaratColumnGroup[];
  getActiveGroup(): ICaratColumnGroup | null;
  getCurveGroup(): ICaratColumnGroup | null;
  getBackgroundGroup(): ICaratColumnGroup;
  getActiveIndex(): number;
  getActiveCurve(): any;
  getInitColumns(): CaratColumnInit[];

  setActiveGroup(idx: number): void;
  setActiveCurve(curve: any): void;

  handleMouseDown(point: Point): any;
  updateGroupRects(): void;

  render(): void;
  lazyRender(): void;
}

/** Инклинометрия скважины. */
interface ICaratInclinometry {
  getAbsMark(depth: number): number;
  getDepth(absMark: number): number;
}

interface IConstructionTransformer {
  parts: any[];
  anchorPoints: CaratAnchorPoint[];
  step: number;
  constructionHeight: number;
  transformCurves(curves: any[]): void;
}
interface CaratAnchorPoint {
  /** Исходная координата по Y. */
  y: number;
  /** Трансформированная координата по Y. */
  ty: number;
}

interface ICaratColumnGroup {
  readonly id: string;
  readonly settings: CaratColumnSettings;
  readonly curveManager: any;
  readonly xAxis: CaratColumnXAxis;
  readonly yAxis: CaratColumnYAxis;

  getDataRect(): Rectangle;
  getWidth(): number;
  getColumns(): ICaratColumn[];
  getRange(): [number, number];
  getStrata(id?: StratumID): any[];
  hasCurveColumn(): boolean;
  groupCurves(curves: any[]): void;
}

interface ICaratColumn {
  rect: Rectangle;
  channel?: CaratAttachedChannel;

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

/** Обязательные поля любого интервального элемента. */
interface ICaratInterval {
  top: number;
  bottom: number;
}

/** Типы распознаваемых каналов, которые могут быть подключены к каротажной форме.
 * + `lithology` — литологические пласты
 * + `perforations` — перфорации
 * + `curve-set` — каротажные кривые
 * + `curve-data` — точки кривых
 * + `inclinometry` — инклинометрия скважины
 * + `bore` (конструкция) — элементы ствола скважины
 * + `pump` (конструкция) — насосы
 * + `face` (конструкция) — забои скважины
 * + `vertical` (конструкция) — вертикальная линия
 * */
type CaratChannelType = 'lithology' | 'perforations' | 'curve-set' | 'curve-data' |
  'inclinometry' | 'bore' | 'pump' | 'face' | 'vertical';

type CaratCurveSetInfo = CaratChannelInfo<'id' | 'type' | 'date' | 'top' | 'bottom' | 'defaultLoading' | 'description'>;
type CaratLithologyInfo = CaratChannelInfo<'top' | 'bottom' | 'stratumID'>;
type CaratChannelInfo<Fields = string> = ChannelColumnInfo<Fields | 'well' | 'bar'>;
