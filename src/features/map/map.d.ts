/* --- Maps State --- */

/** ## Состояние мультикарты.
 * + `sync: boolean` — синхронизация СК
 * + `children`: {@link FormID}[] — карты
 * */
interface MultiMapState {
  sync: boolean;
  templateFormID: FormID;
  children: FormID[];
  configs: MapItemConfig[];
}

interface MapItemConfig {
  id: MapID;
  formID: FormID;
  progress: number;
  stage: IMapStage;
  loader: IMapLoader;
  setProgress?: (process: number) => void;
}

/** Состояние карты. */
interface MapState {
  /** Ссылка на холст. */
  canvas: MapCanvas;
  /** Класс сцены. */
  stage: IMapStage;
  /** Загрузчик. */
  loader: IMapLoader;
  /** Класс для отслеживания изменения размеров холста. */
  observer: ResizeObserver;
  /** Владелец карты. */
  owner: MapOwner;
  /** Идентификатор карты. */
  mapID: MapID;
  /** Состояние загрузки карты. */
  loading: MapLoading;
  /** Можно ли редактировать карту. */
  editable: boolean;
  /** Была ли карта изменена. */
  modified: boolean;
  /** Открыто ли окно свойств элемента. */
  propertyWindowOpen: boolean;
  /** Открыта ли аттрибутивная таблица. */
  attrTableWindowOpen: boolean;
  /** Настройки плагинов карты. */
  pluginsSettings: MapPluginsSettings;
}

interface IMapStage {
  readonly select: IMapSelect;
  readonly scroller: IMapScroller;
  readonly listeners: MapStageListeners;
  traceEditing: boolean;
  inclinometryModeOn: boolean;
  readonly plugins: IMapPlugin[];

  getCanvas(): MapCanvas;
  getMode(): number;
  getSelecting(): boolean;
  getMapData(): MapData;
  getMapDataToSave(): any;
  getActiveLayer(): IMapLayer | null;
  getActiveElement(): MapElement | null;
  getActiveElementLayer(): IMapLayer | null;
  isElementEditing(): boolean;
  isElementCreating(): boolean;
  eventToPoint(event: MouseEvent): Point;

  setCanvas(canvas: MapCanvas): void;
  setData(data: MapData): void;
  setMode(mode: number): void;
  setSelecting(selecting: boolean): void;
  setActiveLayer(layer: IMapLayer): void;

  startCreating(): void;
  startEditing(): void;
  accept(): void;
  cancel(): void;

  clearSelect(): void;
  deleteActiveElement(): void;

  handleMouseUp(event: MouseEvent): MapElement | null;
  handleMouseDown(event: MouseEvent): void;
  handleMouseMove(event: MouseEvent): void;
  handleMouseWheel(event: WheelEvent): void;

  resize(): void;
  render(viewport?: MapViewport): void;
}

interface IMapLoader {
  loadMapData(mapID: MapID, owner: MapOwner): Promise<MapData | string | null>;
  abortLoading(): void;
  onProgressChange(l: MapLoading): void;
}

/** Состояние загрузки данных карты.
 * + `percentage: number`
 * + `status: string`
 * */
interface MapLoading {
  /** Процент загрузки. */
  percentage: number;
  /** Статус загрузки: название загружаемого слоя. */
  status: string;
}

interface IMapSelect {
  onlyActiveLayer: boolean;
  types: Record<MapElementType, boolean>;
}
interface IMapScroller {
  sync: boolean;
  list: MapCanvas[];
  mouseUp(): void;
}
interface MapStageListeners {
  navigationPanelChange(): void;
  selectPanelChange(): void;
  editPanelChange(): void;
  layerTreeChange(): void;
}

type MapCanvas = HTMLCanvasElement & {
  selectingMode: boolean;
  blocked: boolean;
  events: any;
  showMapFlag: any;
};

/* --- Загрузка карты --- */

interface MapDataRaw {
  // ответ сервера:
  date: string;
  eTag: string;
  layers: MapLayerRaw[];
  mapCode: string;
  mapName: string;
  namedpoints: string;
  objectCode: string;
  objectName: string;
  organization: string;
  owner: string | null;
  plastCode: string;
  plastName: string;
  indexes?: any[];

  // добавляемые поля после обратоки:
  mapErrors: any[];
  points: any;
}

interface MapLayerRaw {
  bounds: Bounds;
  container: string;
  group: string;
  highscale: string | number;
  lowscale: string | number;
  name: string;
  uid: string;
  visible: boolean;
  index?: any;
  version?: any;
}


interface ParsedContainer {
  layers: Record<string, any>;
  namedpoints: MapPoint[];
}

/* --- --- */

interface MapViewport {
  centerX: number;
  centerY: number;
  scale: MapScale;
}

interface MapData {
  date: string;
  eTag: string;
  layers: IMapLayer[];
  mapCode: string;
  mapData: any;
  mapErrors: any[];
  mapName: string;
  namedPoints: string;
  objectCode: string;
  objectName: string;
  organization: string;
  owner: MapOwner | null;
  plastCode: string;
  plastName: string;
  points: MapPoint[];

  x: number;
  y: number;
  scale: number;
  onDrawEnd: (center: Point, scale: number) => void;
}

interface LayerTreeItem {
  id: string;
  text: string;
  sublayer: IMapLayer;
  visible: boolean;
  items?: LayerTreeItem[];
}

/** Слой карты. */
interface IMapLayer {
  readonly id: string;
  readonly group: string;
  readonly displayName: string;
  readonly elementType: MapElementType;

  bounds: Bounds;
  elements: MapElement[];
  visible: boolean;
  active: boolean;
  modified: boolean;
  readonly temporary: boolean;

  getMinScale(): number;
  getMaxScale(): number;
  isScaleVisible(scale: MapScale): boolean;

  setMinScale(scale: number): void;
  setMaxScale(scale: number): void;
  toInit(): MapLayerRaw & {elements: MapElement[], modified: boolean};
}

/** Границы объекта (слоя, элемента) карты.
 * + `max`: {@link Point}
 * + `min`: {@link Point}
 * + `top?: number` — верхняя граница
 * + `bottom?: number` — нижняя граница
 * + `left?: number` — левая граница
 * + `right?: number` — правая граница
 * */
interface Bounds {
  max: Point;
  min: Point;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface MapPoint {
  x: number;
  y: number;
  name: string;
  UWID: string;
  attrTable: Record<string, any>;
  selected?: boolean;
}

/** Масштаб карты. */
type MapScale = number;
/** Идентификатор карты — числовая строка. */
type MapID = string;

/** Владелец карты.
 * @example
 * "Common", "706\\VIN"
 * */
type MapOwner = string;

/* --- Map Elements Types --- */

/** Элемент карты. */
type MapElement = MapPolyline | MapLabel | MapSign | MapField;

/** Тип элемента карты. */
type MapElementType = 'polyline' | 'label' | 'sign' | 'field';

/* -- Polyline -- */

interface MapPolyline extends MapElementProto {
  type: 'polyline';
  arcs: PolylineArc[];
  borderstyle: number;
  borderstyleid?: any;
  fillbkcolor: string;
  fillcolor: string;
  fillname?: any;
  bordercolor: string;
  borderwidth: number;
  legend?: any;
  style?: PolylineBorderStyle;
  fillStyle?: CanvasPattern | string;
  isTrace?: boolean;
}

/** ### Дуга линии.
 * + `path`: {@link PolylineArcPath} — путь
 * + `closed`: {@link IsArcClosed} — замкнутость
 * @example
 * { path: [12, 15, 42, 48, 11, 10], closed: false }
 * */
interface PolylineArc {
  path: PolylineArcPath;
  closed: IsArcClosed;
}

/** Путь дуги линии. Набор пар координат точек: `[x1, y1, x2, y2, ...]`. */
type PolylineArcPath = number[];

/** Является ли дуга линии замкнутой. */
type IsArcClosed = boolean;

interface PolylineBorderStyle {
  guid: string;
  name: string;
  baseColor?: string;
  baseThickness?: number;
  strokeDashArray?: PolylineStrokeDashArray;
  Decoration?: BorderStyleDecoration[];
}

interface PolylineStrokeDashArray {
  data: string;
  onBase: boolean;
  color?: string;
}

interface BorderStyleDecoration {
  initialInterval: number;
  interval: number;
  offsetX: number;
  offsetY: number;
  thickness?: number;
  Shape: {Line?: ShapeLine[], Polyline?: any[]};
}

interface ShapeLine {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/* -- Label -- */

/** ## Подпись.
 * + `x, y` — координаты
 * + `xoffset`: {@link MapLabelOffset} — смещение по x
 * + `yoffset`: {@link MapLabelOffset} — смещение по y
 * + `halignment`: {@link MapLabelAlignment} — выравнивание по горизонтали
 * + `valignment`: {@link MapLabelAlignment} — выранивание по вертикали
 * + `text` — текст подписи
 * + `color` — цвет текста
 * + `fontname` — название шрифта
 * + `fontsize` — размер шрифта
 * + `angle`: {@link MapLabelAngle} — угол поворота подписи
 * @example
 * { type: "label", text: "222", color: "black", angle: 0, ... }
 * @see MapElement
 * @see MapElementProto
 * */
interface MapLabel extends MapElementProto {
  type: 'label';
  x: number;
  y: number;
  xoffset: MapLabelOffset;
  yoffset: MapLabelOffset;
  halignment: MapLabelAlignment;
  valignment: MapLabelAlignment;
  text: string;
  color: string;
  fontname: string;
  fontsize: number;
  angle: MapLabelAngle;
}

/** ### Выравнивание подписи.
 * + `0` — горизонталь: `left`, вертикаль: `bottom`
 * + `1` — горизонталь: `center`, вертикаль: `center`
 * + `2` — горизонталь: `right`, вертикаль: `top`
 * @example
 * { ..., hAlignment: 1, vAlignment: 1 }
 * */
type MapLabelAlignment = 0 | 1 | 2;

/** Смещение подписи относительно "якоря". */
type MapLabelOffset = number;

/** Угол поворота подписи в _градусах_.
 * Нулевой угол соответствует подписи без наклона.
 * @example
 * 180 // перевернутая подпись
 * */
type MapLabelAngle = number;

/* -- Sign -- */

/** Точечный объект.
 * + `x, y` — координаты
 * + `size` — размер
 * + `color` — цвет заполнения
 * + `fontname` — название шрифта
 * + `symbolcode` — ID паттерна
 * + `img`: {@link HTMLImageElement} — паттерн
 * @see MapElement
 * */
interface MapSign extends MapElementProto {
  type: 'sign';
  x: number;
  y: number;
  size: number;
  color: string;
  fontname: string;
  symbolcode: number;
  img: HTMLImageElement;
}

/* -- Map Element Prototype -- */

/** Собрание полей, которые может содержать любой элемент карты.
 * + `bounds?`: {@link Bounds} — границы
 * + `attrTable?` — "аттрибутивная таблица"
 * + `transparent?` — прозрачность
 * + `selected?` — выделение (текущее состояние)
 * + `edited?` — редактируемость (текущее состояние)
 * @see MapElement
 * */
interface MapElementProto {
  /** Bounding Box элемента (границы). */
  bounds?: Bounds;
  /** Аттрибутивная таблица. */
  attrTable?: any;
  /** Является ли элемент или его часть прозрачной. */
  transparent?: boolean;
  /** Выбран ли элемент в текущий момент. */
  selected?: boolean;
  /** Редактируется ли элемент в текущий момент. */
  edited?: boolean;
}

/* -- Field -- */

/** Поле.
 * + `x, y` — координаты
 * + `sizeX` — количество ячеек по X
 * + `sizeY` — количество ячеек по Y
 * + `stepX` — размер шага ячейки в координатах карты по X
 * + `stepY` — размер шага ячейки в координатах карты по Y
 * + `palette` — палитра поля
 * + `sourceRenderDataMatrix` — матрица значений поля
 * @see MapElement
 * @see MapElementProto
 * */
interface MapField extends MapElementProto {
  type: 'field';
  x: number;
  y: number;
  sizex: number;
  sizey: number;
  stepx: number;
  stepy: number;
  palette: MapFieldPalette;
  sourceRenderDataMatrix: Matrix;
}

interface MapFieldPalette {
  interpolated: '-1' | '0';
  level: MapFieldPaletteLevel[];
}

interface MapFieldPaletteLevel {
  color: string;
  value: number;
}
