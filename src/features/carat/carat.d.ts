/** Хранилище каротажных диаграмм. */
type CaratsState = FormDict<CaratState>;

/** Состояние каротажной формы.
 * + `data`: {@link CaratData}
 * + `model`: {@link ICaratViewModel}
 * + `drawer`: {@link ICaratDrawer}
 * + `canvas`: {@link HTMLCanvasElement}
 * + `activeColumn`: {@link CaratColumnInit}
 * */
interface CaratState {
  /** Данные для отрисовки. */
  data: CaratData,
  /** Модель отображения. */
  model: ICaratViewModel;
  /** Экземпляр отрисовщика. */
  drawer: ICaratDrawer,
  /** Ссылка на холст. */
  canvas: HTMLCanvasElement,
  /** Текущая активная колонка. */
  activeColumn: CaratColumnInit | null,
}

/** Порт просмотра. */
interface CaratViewport {
  /** Вертикальное положение. */
  y: number,
  /** Масштаб: количество пикселей в метре. */
  scale: number,
}

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

/* --- Rendering --- */

/** Модель отображения каротажной диаграммы. */
interface ICaratViewModel {
  getViewport(): CaratViewport
  getColumns(): CaratColumnInit[]
  getColumnIndex(xCoordinate: number): number
  setActiveColumn(idx: number): void
  setColumnWidth(idx: number, width: number): void
  setColumnLabel(idx: number, label: string): void
  resize(width: number, height: number): void
  setViewportScale(scale: number): void
}

/** Отрисовщик каротажной диаграммы. */
interface ICaratDrawer {
  resize(): void
  setCanvas(canvas: HTMLCanvasElement): void
  render(well?: string, viewport?: CaratViewport, columns?: CaratColumnInit[], data?: CaratData): void
}
