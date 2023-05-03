/** Хранилище каротажных диаграмм. */
type CaratsState = FormDict<CaratState>;

/** Состояние каротажной формы.
 * + `stage`: {@link ICaratStage}
 * + `canvas`: {@link HTMLCanvasElement}
 * + `observer`: {@link ResizeObserver}
 * + `activeGroup`: {@link ICaratColumnGroup}
 * + `activeCurve`: CaratCurveModel
 * + `lookupNames`: {@link ChannelName}[]
 * */
interface CaratState {
  /** Экземпляр класса сцены. */
  stage: ICaratStage;
  /** Ссылка на холст. */
  canvas: HTMLCanvasElement,
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
  lastData: ChannelDict,
}

/** Сцена каротажной диаграммы. */
interface ICaratStage {
  readonly useStaticScale: boolean;
  readonly strataChannelName: ChannelName;

  getZones(): CaratZone[]
  getCaratSettings(): CaratSettings
  getActiveTrack(): ICaratTrack

  setZones(zones: CaratZone[]): void
  setCanvas(canvas: HTMLCanvasElement): void
  setWell(well: string): void
  setScale(scale: number): void

  setChannelData(channelData: ChannelDict): void
  setCurveData(channelData: ChannelDict): Promise<any>
  setLookupData(lookupData: ChannelDict): void

  handleKeyDown(key: string): boolean
  handleMouseMove(by: number): void
  handleMouseDown(x: number, y: number): any
  handleMouseWheel(x: number, y: number, direction: 1 | -1): void

  resize(): void
  render(): void
}

/** Трек каротажной диаграммы. */
interface ICaratTrack {
  readonly rect: BoundingRect,
  readonly viewport: CaratViewport,

  getGroups(): ICaratColumnGroup[]
  getBackgroundGroup(): ICaratColumnGroup
  getInitColumns(): CaratColumnInit[]
  getActiveGroup(): ICaratColumnGroup | null
  getActiveIndex(): number

  setWell(well: string): void
  setScale(scale: number): void
  setActiveGroup(idx: number): void
  setActiveGroupWidth(width: number): void
  setActiveCurve(curve: any): void,

  moveGroup(idx: number, to: 'left' | 'right'): void
  handleMouseDown(x: number, y: number): any

  render(): void
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

  setHeight(height: number): void

  renderBody(): void
  renderContent(): void
}

interface ICaratColumn {
  channel?: CaratAttachedChannel;
  getElements?(): any[]
  getRange(): [number, number]
  render(): void
}

/** Порт просмотра. */
interface CaratViewport {
  /** Вертикальное положение. */
  y: number,
  /** Масштаб: количество пикселей в метре. */
  scale: number,
  /** Минимально возможная координата по Y. */
  min: number,
  /** Максимально возможная координата по Y. */
  max: number,
}

/** Идентификатор каротажной кривой. */
type CaratCurveID = number;
/** Тип каротажной кривой. */
type CaratCurveType = string;

/** Типы корректных подключённых каналов к каротажной форме. */
type CaratChannelType = 'lithology' | 'perforations' | 'curve-set' | 'curve-data';

type CaratCurveSetInfo = CaratChannelInfo<'id' | 'type' | 'date' | 'top' | 'bottom' | 'defaultLoading'>;
type CaratCurveDataInfo = CaratChannelInfo<'id' | 'data' | 'top' | 'bottom' | 'min' | 'max'>;
type CaratLithologyInfo = CaratChannelInfo<'top' | 'base' | 'stratumID'>;
type CaratChannelInfo<Fields = string> = Record<Fields | 'style' | 'bar', LookupColumnInfo>;
