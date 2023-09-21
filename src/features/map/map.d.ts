/* --- Maps State --- */

/** Хранилище состояний карт.
 * + `multi`: {@link FormDict} of {@link MultiMapState}
 * + `single`: {@link FormDict} of {@link MapState}
 * */
interface MapsState {
  multi: FormDict<MultiMapState>;
  single: FormDict<MapState>;
}

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
  data: any;
  formID: FormID;
  progress: number;
  setProgress?: (process: number) => void;
}

/** ## Состояние карты.
 * + `mode`: {@link MapModes} — режим карты
 * + `mapData`: {@link MapData} — данные для отрисовки
 * + `activeLayer`: {@link MapLayer} — активный слой
 * + `isLoadSuccessfully` — состояние загрузки
 * + `canvas` — HTML элемент `<canvas>`
 * + `owner`: {@link MapOwner} — владелец
 * + `mapID`: {@link MapID} — ID карты
 * + `selecting`: {@link MapSelectingState}
 * + `isModified` — изменена ли карта
 * + `cursor` — стиль курсора
 * + `childOf`: {@link FormID}
 * + `utils`: {@link MapUtils} — вспомогательные функции
 * @see MapsState
 * */
interface MapState {
  mode: number, // MapModes
  mapData: MapData;
  legends: any;
  activeLayer: MapLayer;
  isLoadSuccessfully: boolean | undefined;
  canvas: MapCanvas;
  owner: MapOwner;
  mapID: MapID;
  element: MapElement;
  isElementEditing: boolean;
  isElementCreating?: boolean;
  selecting: MapSelectingState;
  oldData: {x: number | null, y: number | null, arc: PolylineArc | null, ange: number | null};
  isModified: boolean;
  cursor: string;
  childOf: ClientID;
  scroller: { setList(list: MapCanvas[]) } | null;
  utils: MapUtils;
}

type MapCanvas = HTMLCanvasElement & {selectingMode: boolean, blocked: boolean, events: any};

interface MapUtils {
  updateCanvas(cs?: MapViewport): void;
  pointToMap(point: Point): Point;
}

/** ## Состояние выделения карты.
 * + `nearestElements` — список ближайших элементов
 * + `activeIndex` — иднекс списка элементов
 * + `lastPoint` — точка последнего клика
 * @see MapState
 * */
interface MapSelectingState {
  nearestElements: any[];
  activeIndex: number;
  lastPoint: Point;
}

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
  layers: MapLayer[];
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
  onDrawEnd: (canvas: MapCanvas, x: number, y: number, scale: number) => void;
}

interface LayerTreeItem {
  id: string;
  text: string;
  sublayer: MapLayer;
  visible: boolean;
  items?: LayerTreeItem[];
}

/** Слой карты. */
interface MapLayer {
  bounds: Bounds;
  container: string;
  elements: MapElement[];
  group: string;
  highscale: LayerHighScale;
  lowscale: number;
  name: string;
  uid: string;
  index?: any;
  version: any;
  visible?: boolean;
  elementType?: MapElementType;
  modified?: boolean;
  temporary?: boolean;
}

/** Максимальный масштаб карты, при котором данный слой будет отрисовываться. */
type LayerHighScale = number | 'INF';

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
  guid: {_value: string};
  name: {_value: string};
  baseColor?: {_value: string};
  baseThickness?: {_value: number};
  Decoration?: BorderStyleDecoration[];
  StrokeDashArrays?: {StrokeDashArray: StrokeDashArray[]}[];
}

interface BorderStyleDecoration {
  initialInterval: {_value: number};
  interval: {_value: number};
  offsetX: {_value: number};
  offsetY: {_value: number};
  thickness?: {_value: number};
  Shape: {Line?: ShapeLine[], Polyline?: any[]}[];
}

interface StrokeDashArray {
  data: {_value: string};
  onBase: {_value: boolean};
  color?: {_value: string};
  _text: any[];
}

interface ShapeLine {
  x1: {_value: number};
  x2: {_value: number};
  y1: {_value: number};
  y2: {_value: number};
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

/** ## Точечный объект.
 * + `x, y` — координаты
 * + `size` — размер
 * + `color` — цвет заполнения
 * + `fontname` — название шрифта
 * + `symbolcode` — ID паттерна
 * + `img`: {@link HTMLImageElement} — паттерн
 * @see MapElement
 * @see MapElementProto
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

interface SignImageProto {
  fontName: string;
  symbolCode: number;
  color: string;
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

/** ## Точечный объект.
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
