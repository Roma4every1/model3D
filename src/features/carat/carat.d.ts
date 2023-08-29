/** Хранилище каротажных диаграмм. */
type CaratStates = FormDict<CaratState>;

/** Состояние каротажной формы.
 * + `canvas`: {@link HTMLCanvasElement}
 * + `stage`: {@link ICaratStage}
 * + `loader`: {@link ICaratLoader}
 * + `observer`: {@link ResizeObserver}
 * + `activeGroup`: {@link ICaratColumnGroup}
 * + `curveGroup`: {@link ICaratColumnGroup}
 * + `activeCurve: CaratCurveModel`
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
  /** Активная колонка. */
  activeGroup: ICaratColumnGroup | null;
  /** Колонка с кривыми (активная или первая с кривыми). */
  curveGroup: ICaratColumnGroup | null;
  /** Активная кривая. */
  activeCurve: any;
  /** Список всех используемых каналов. */
  channelNames: ChannelName[];
  /** Список всех названий каналов-справочников. */
  lookupNames: ChannelName[];
  /** Находится ли форма в состоянии загрузки. */
  loading: boolean;
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
}

/** Загрузчик данных для построения каротажа по трассе. */
interface ICaratLoader {
  flag: number;
  cache: CurveDataCache;

  getCaratData(ids: WellID[], channelData: ChannelDict): Promise<ChannelRecordDict[]>;
  loadCurveData(ids: CaratCurveID[]): Promise<CaratCurveID[]>;
}

/* --- --- */

/** Сцена каротажной диаграммы. */
interface ICaratStage {
  wellIDs: WellID[];
  trackList: ICaratTrack[];
  correlations: ICaratCorrelations;
  listeners: CaratStageListeners;

  getZones(): CaratZone[];
  getCaratSettings(): CaratSettings;
  getActiveTrack(): ICaratTrack;

  setCanvas(canvas: HTMLCanvasElement): void;
  setTrackList(wells: WellModel[]): void;
  setActiveTrack(idx: number): void;
  setZones(zones: CaratZone[]): void;
  edit(action: StageEditAction): void;

  alignByStratum(id: StratumID, byTop: boolean): void;
  gotoStratum(id: StratumID): void;

  setData(data: ChannelRecordDict[], cache: CurveDataCache): void;
  setLookupData(lookupData: ChannelRecordDict): void;

  handleKeyDown(key: string): boolean;
  handleMouseMove(point: Point, by: number): void;
  handleMouseDown(point: Point): any;
  handleMouseWheel(point: Point, direction: 1 | -1, ctrlKey: boolean): void;

  updateTrackRects(): void;
  resize(): void;

  render(): void;
  lazyRender(index: number): void;
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
  scaleChange(newScale: number): void;
}

/** Трек каротажной диаграммы. */
interface ICaratTrack {
  wellName: WellName;
  readonly rect: BoundingRect;
  readonly viewport: CaratViewport;
  readonly inclinometry: ICaratInclinometry;

  getGroups(): ICaratColumnGroup[];
  getBackgroundGroup(): ICaratColumnGroup;
  getInitColumns(): CaratColumnInit[];
  getActiveGroup(): ICaratColumnGroup | null;
  getActiveIndex(): number;

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
  channel?: CaratAttachedChannel;
  getElements?(): any[];
  getRange(): [number, number];
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

/** Типы корректных подключённых каналов к каротажной форме. */
type CaratChannelType = 'lithology' | 'perforations' | 'curve-set' | 'curve-data' | 'inclinometry';

type CaratCurveSetInfo = CaratChannelInfo<'id' | 'type' | 'date' | 'top' | 'bottom' | 'defaultLoading' | 'description'>;
type CaratLithologyInfo = CaratChannelInfo<'top' | 'bottom' | 'stratumID'>;
type CaratChannelInfo<Fields = string> = ChannelColumnInfo<Fields | 'well' | 'bar'>;
