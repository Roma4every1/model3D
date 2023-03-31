/** Хранилище каротажных диаграмм. */
type CaratsState = FormDict<CaratState>;

/** Состояние каротажной формы.
 * + `data`: {@link CaratData}
 * + `model`: {@link ICaratViewModel}
 * + `drawer`: {@link ICaratDrawer}
 * + `canvas`: {@link HTMLCanvasElement}
 * + `activeColumn`: {@link CaratColumn}
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
  activeColumn: CaratColumn | null,
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

/* --- Rendering --- */

/** Модель отображения каротажной диаграммы. */
interface ICaratViewModel {
  getViewport(): CaratViewport
  getColumns(): CaratColumn[]
  getColumnIndex(xCoordinate: number): number
  setActiveColumn(idx: number): void
  setColumnWidth(idx: number, width: number): void
  setColumnLabel(idx: number, label: string): void
  resize(width: number, height: number): void
  setViewportScale(scale: number): void
}

/** Отрисовщик каротажной диаграммы. */
interface ICaratDrawer {
  setCanvas(canvas: HTMLCanvasElement): void
  render(well?: string, viewport?: CaratViewport, columns?: CaratColumn[], data?: CaratData): void
}

/* --- Form Settings --- */

/** Ответ `/getFormSettings` для каротажной формы. */
interface CaratFormSettings {
  settings: CaratSettings,
  columns: CaratColumn[],
}

/** Атрибуты тега <carat/>. */
interface CaratSettings {
  metersInMeter: number,
}

/** carat > child client > caratColumn */
interface CaratColumn {
  type: string,
  settings: CaratColumnSettings,
  plugins: Record<ChannelName, Partial<CaratColumnPlugins>>,
  channels: ChannelName[],
  active?: boolean,
}

/** carat > child client > caratColumn > columnSettings */
interface CaratColumnSettings {
  label: string,
  width: number,
  showAxis: boolean,
  showGrid: boolean,
  step: number,
}

interface CaratColumnPlugins {
  channelSettings: CaratChannelSettings | null,
  channelCaratSettings: CaratChannelCaratSettings | null,
}

/* --- Carat Plugins --- */

/** carat > child client > caratColumn > plugins > plugin > caratChannelSettings */
interface CaratChannelSettings {
  fillLineChannelSettings: {
    showDiagram: boolean, showFill: boolean, showLine: boolean,
    zOrder: number, thickness: number,
    color: string,
    backgroundColor: string,
    borderColor: string,
  },
}

/** carat > child client > caratColumn > plugins > plugin > caratChannelCaratSettings */
interface CaratChannelCaratSettings {
  displaySettings: {
    isConstructionMode: boolean,
    showAbsMarks: boolean,
    showDepthMarks: boolean,
    zOrder: number,
    axisHeight: number,
    numberOfMarks: number,
    showVGrid: boolean,
  },
}
