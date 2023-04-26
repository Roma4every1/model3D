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
  getRect(): BoundingRect
  getColumns(): ICaratColumnGroup[]
  getInitColumns(): CaratColumnInit[]
  getViewport(): CaratViewport

  setWell(well: string): void
  setScale(scale: number): void
  setActiveColumn(idx: number): void

  setChannelData(channelData: ChannelDict): void
  setCurveData(channelData: ChannelDict): Promise<void>
  setLookupData(lookupData: ChannelDict): void

  handleMouseDown(x: number, y: number): void

  render(): void
}

interface ICaratColumnGroup {
  getLabel(): string
  getWidth(): number
  getYAxisStep(): number

  setLabel(label: string): void
  setWidth(width: number): void
  setHeight(height: number): void
  setYAxisStep(step: number): void

  setChannelData(channelData: ChannelDict): void
  setLookupData(lookupData: ChannelDict): void

  renderBody(): void
  renderContent(): void
}

/** Порт просмотра. */
interface CaratViewport {
  /** Вертикальное положение. */
  y: number,
  /** Масштаб: количество пикселей в метре. */
  scale: number,
}

/** Тип каротажной кривой. */
type CaratCurveType = string;
/** Типы корректных подключённых каналов к каротажной форме. */
type CaratChannelType = 'lithology' | 'perforations' | 'curve-set' | 'curve-data';

type CaratCurveSetInfo = CaratChannelInfo<'id' | 'type' | 'date'>;
type CaratCurveDataInfo = CaratChannelInfo<'id' | 'data' | 'top' | 'left'>;
type CaratLithologyInfo = CaratChannelInfo<'top' | 'base' | 'stratum'>;
type CaratPerforationsInfo = CaratChannelInfo<'top' | 'base' | 'date'>;
type CaratChannelInfo<Fields = string> = Record<Fields | 'style' | 'bar', LookupColumnInfo>;
