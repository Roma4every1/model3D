/** Хранилище каротажных диаграмм. */
type CaratsState = FormDict<CaratState>;

/** Состояние каротажной формы.
 * + `stage`: {@link ICaratStage}
 * + `canvas`: {@link HTMLCanvasElement}
 * + `activeColumn`: {@link ICaratColumn}
 * */
interface CaratState {
  /** Экземпляр класса сцены. */
  stage: ICaratStage;
  /** Ссылка на холст. */
  canvas: HTMLCanvasElement,
  /** Активная колонка. */
  activeColumn: ICaratColumn | null,
}

/** Сцена каротажной диаграммы. */
interface ICaratStage {
  getActiveTrack(): ICaratTrack

  setCanvas(canvas: HTMLCanvasElement): void
  setWell(well: string): void
  setChannelData(channelData: ChannelDict): void
  setScale(scale: number): void

  handleMouseMove(by: number): void
  handleMouseWheel(by: number): void
  handleMouseDown(x: number, y: number): void

  resize(): void
  render(): void
}

/** Трек каротажной диаграммы. */
interface ICaratTrack {
  getRect(): BoundingRect
  getColumns(): ICaratColumn[]
  getViewport(): CaratViewport

  setWell(well: string): void
  setViewportScale(scale: number): void
  setActiveColumn(idx: number): void

  handleMouseDown(x: number, y: number): void

  render(): void
}

/** Колонка каротажной диаграммы. */
interface ICaratColumn {
  getLabel(): string
  getWidth(): number
  getYAxisStep(): number

  setLabel(label: string): void
  setWidth(width: number): void
  setYAxisStep(step: number): void
  updateData(): void

  render(viewport: CaratViewport): void
}

/** Порт просмотра. */
interface CaratViewport {
  /** Вертикальное положение. */
  y: number,
  /** Масштаб: количество пикселей в метре. */
  scale: number,
}

/* --- OLD --- */

/** Данные для отрисовки каротажа. */
type CaratData = Record<ChannelName, CaratDataModel>;

/** Данные канала для отрисовки каротажной колонки. */
type CaratDataModel = CaratIntervalsModel;

/** Модель интервального типа отрисовки. */
interface CaratIntervalsModel {
  type: 'intervals',
  /** Найдены ли индексы колонок. */
  applied: boolean,
  info: CaratIntervalsInfo,
  data: CaratRenderedInterval[],
}
interface CaratIntervalsInfo {
  top: PropertyColumnInfo,
  base: PropertyColumnInfo,
}
interface CaratRenderedInterval {
  top: number,
  base: number,
}

interface PropertyColumnInfo {
  name: string,
  index: number,
}

interface CaratStyleInterval {
  color: ColorHEX,
  borderColor: ColorHEX,
  backgroundColor: ColorHEX,
  fillStyle: string,
  lineStyle: string,
}

/** Тип каротажной кривой. */
type CaratCurveType = string;
