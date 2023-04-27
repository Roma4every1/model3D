/** Хранилище каротажных диаграмм. */
type CaratsState = FormDict<CaratState>;

/** Состояние каротажной формы.
 * + `stage`: {@link ICaratStage}
 * + `canvas`: {@link HTMLCanvasElement}
 * + `observer`: {@link ResizeObserver}
 * + `activeGroup`: {@link ICaratColumnGroup}
 * + `zones`: {@link CaratZone}[]
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
  /** Зоны распределения каротажных кривых. */
  zones: CaratZone[],
  /** Список всех названий каналов-справочников. */
  lookupNames: ChannelName[],
}

/** Сцена каротажной диаграммы. */
interface ICaratStage {
  getCaratSettings(): CaratSettings
  getActiveTrack(): ICaratTrack

  setCanvas(canvas: HTMLCanvasElement): void
  setWell(well: string): void
  setScale(scale: number): void

  setChannelData(channelData: ChannelDict): void
  setCurveData(channelData: ChannelDict): Promise<void>
  setLookupData(lookupData: ChannelDict): void

  handleMouseMove(by: number): void
  handleMouseDown(x: number, y: number): boolean
  handleMouseWheel(x: number, y: number, by: number): void

  resize(): void
  render(): void
}

/** Трек каротажной диаграммы. */
interface ICaratTrack {
  readonly rect: BoundingRect,
  readonly viewport: CaratViewport,

  getColumns(): ICaratColumnGroup[]
  getInitColumns(): CaratColumnInit[]
  getActiveGroup(): ICaratColumnGroup | null

  setWell(well: string): void
  setScale(scale: number): void
  setActiveGroup(idx: number): void

  setChannelData(channelData: ChannelDict): void
  setCurveData(channelData: ChannelDict): Promise<void>
  setLookupData(lookupData: ChannelDict): void

  handleMouseDown(x: number, y: number): void

  render(): void
}

interface ICaratColumnGroup {
  readonly id: string,
  readonly settings: CaratColumnSettings,
  readonly curveManager: any,

  getLabel(): string
  getWidth(): number
  getYAxisStep(): number
  getElementsRange(): [number, number]
  getCurvesRange(): [number, number]

  setLabel(label: string): void
  setWidth(width: number): void
  setHeight(height: number): void
  setYAxisStep(step: number): void

  setChannelData(channelData: ChannelDict): void
  setLookupData(lookupData: ChannelDict): void

  renderBody(): void
  renderContent(): void
}

interface ICaratColumn {
  getRange(): [number, number]
  setHeight(height: number): void
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

type CaratCurveSetInfo = CaratChannelInfo<'id' | 'type' | 'date' | 'top' | 'bottom'>;
type CaratCurveDataInfo = CaratChannelInfo<'id' | 'data' | 'top' | 'bottom' | 'min' | 'max'>;
type CaratLithologyInfo = CaratChannelInfo<'top' | 'base' | 'stratum'>;
type CaratPerforationsInfo = CaratChannelInfo<'top' | 'base' | 'date'>;
type CaratChannelInfo<Fields = string> = Record<Fields | 'style' | 'bar', LookupColumnInfo>;
