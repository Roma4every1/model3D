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
  canvas: HTMLCanvasElement,
  /** Экземпляр класса сцены. */
  stage: ICaratStage,
  /** Класс, реализующий загрузку данных для построения каротажа по трассе. */
  loader: ICaratLoader,
  /** Класс для отслеживания изменения размеров холста. */
  observer: ResizeObserver,
  /** Активная колонка. */
  activeGroup: ICaratColumnGroup | null,
  /** Колонка с кривыми (активная или первая с кривыми). */
  curveGroup: ICaratColumnGroup | null,
  /** Активная кривая. */
  activeCurve: any,
  /** Список всех названий каналов-справочников. */
  lookupNames: ChannelName[],
  /** Последние установленные данные. */
  lastData: ChannelDataDict[],
}

/** Загрузчик данных для построения каротажа по трассе. */
interface ICaratLoader {
  getFlag(): number
  loadCurveData(ids: CaratCurveID[]): Promise<ChannelData>
  loadWellData(state: WState, ids: WellID[], data: ChannelDataDict): Promise<ChannelDataDict[]>
}

/** Сцена каротажной диаграммы. */
interface ICaratStage {
  wellIDs: WellID[];
  traceMode: boolean;
  readonly correlationInit: CaratColumnInit

  getZones(): CaratZone[]
  getCaratSettings(): CaratSettings
  getActiveTrack(): ICaratTrack

  setWellMode(well: WellModel): void
  setTraceMode(trace: TraceModel): void

  setCanvas(canvas: HTMLCanvasElement): void
  setScale(scale: number): void
  setZones(zones: CaratZone[]): void

  setChannelData(data: ChannelDataDict[]): void
  setCurveData(data: ChannelDataDict[]): Promise<void>
  setLookupData(lookupData: ChannelDataDict): void

  handleKeyDown(key: string): boolean
  handleMouseMove(by: number): void
  handleMouseDown(point: Point): any
  handleMouseWheel(point: Point, direction: 1 | -1): void

  resize(): void
  render(): void
}

/** Трек каротажной диаграммы. */
interface ICaratTrack {
  readonly rect: BoundingRect,
  readonly viewport: CaratViewport,
  readonly inclinometry: ICaratInclinometry;

  getGroups(): ICaratColumnGroup[]
  getBackgroundGroup(): ICaratColumnGroup
  getInitColumns(): CaratColumnInit[]
  getActiveGroup(): ICaratColumnGroup | null
  getActiveIndex(): number

  setWellName(wellName: WellName): void
  setScale(scale: number): void
  setActiveGroup(idx: number): void
  setActiveCurve(curve: any): void
  setActiveGroupWidth(width: number): void
  setActiveGroupLabel(label: string): void
  setActiveGroupYAxisStep(step: number): void

  moveGroup(idx: number, to: 'left' | 'right'): void
  handleMouseDown(point: Point): any

  render(): void
  lazyRender(): void
}

/** Инклинометрия скважины. */
interface ICaratInclinometry {
  getAbsMark(depth: number): number
}

interface ICaratColumnGroup {
  readonly id: string,
  readonly settings: CaratColumnSettings,
  readonly curveManager: any,
  readonly xAxis: CaratColumnXAxis,
  readonly yAxis: CaratColumnYAxis,

  getWidth(): number
  getColumns(): ICaratColumn[]
  getElementsRange(): [number, number]
  getCurvesRange(): [number, number]
  hasCurveColumn(): boolean
}

interface ICaratColumn {
  channel?: CaratAttachedChannel;
  getElements?(): any[]
  getRange(): [number, number]
}

/** Порт просмотра. */
interface CaratViewport {
  /** Текущая координата по Y. */
  y: number,
  /** Высота области просмотра. */
  height: number,
  /** Минимально возможная координата по Y. */
  min: number,
  /** Максимально возможная координата по Y. */
  max: number,
  /** Масштаб: количество пикселей в метре. */
  scale: number,
  /** Состояние прокрутки. */
  scroll: CaratViewportScroll,
}

/** Состояние прокрутки. */
interface CaratViewportScroll {
  /** Очередь движений. */
  queue: number[],
  /** Направление движения. */
  direction: number,
  /** Шаг смещения за единицу прокрутки. */
  step: number,
  /** ID из `setInterval`. */
  id: number | null,
}

/** Идентификатор каротажной кривой. */
type CaratCurveID = number;
/** Тип каротажной кривой. */
type CaratCurveType = string;

/** Типы корректных подключённых каналов к каротажной форме. */
type CaratChannelType = 'lithology' | 'perforations' | 'curve-set' | 'curve-data' | 'inclinometry';

type CaratCurveSetInfo = CaratChannelInfo<'id' | 'type' | 'date' | 'top' | 'bottom' | 'defaultLoading' | 'description'>;
type CaratCurveDataInfo = CaratChannelInfo<'id' | 'data' | 'top' | 'bottom' | 'min' | 'max'>;
type CaratLithologyInfo = CaratChannelInfo<'top' | 'bottom' | 'stratumID'>;
type CaratChannelInfo<Fields = string> = Record<Fields | 'bar', LookupColumnInfo>;
