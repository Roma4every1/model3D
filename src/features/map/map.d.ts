/** Состояние карты. */
interface MapState {
  /** Класс сцены. */
  readonly stage: IMapStage;
  /** Загрузчик. */
  readonly loader: IMapLoader;
  /** Класс для отслеживания изменения размеров холста. */
  readonly observer: ResizeObserver;
  /** Ссылка на холст. */
  canvas: MapCanvas;
  /** Владелец карты. */
  owner: MapStorageID;
  /** Идентификатор карты. */
  mapID: MapID;
  /** Состояние загрузки карты. */
  status: MapStatus;
  /** Можно ли редактировать карту. */
  editable: boolean;
  /** Была ли карта изменена. */
  modified: boolean;
  /** Открыто ли окно свойств элемента. */
  propertyWindowOpen: boolean;
  /** Открыта ли аттрибутивная таблица. */
  attrTableWindowOpen: boolean;
}

/**
 * Статус загрузки карты.
 * + `ok` — данные загружены
 * + `empty` — карты не существует
 * + `loading` — загрузка данных карты
 * + `error` — ошибка при загрузке
 */
type MapStatus = 'ok' | 'empty' | 'loading' | 'error';

interface IMapStage {
  readonly select: IMapSelect;
  readonly scroller: IMapScroller;
  readonly listeners: MapStageListeners;
  readonly plugins: IMapPlugin[];
  inclinometryModeOn: boolean;

  getCanvas(): MapCanvas;
  getMode(): number;
  getSelecting(): boolean;
  getMapData(): MapData;
  getMapDataToSave(): any;
  getActiveLayer(): IMapLayer | null;
  getActiveElement(): MapElement | null;
  getActiveElementLayer(): IMapLayer | null;
  getExtraLayers(): IMapLayer[];
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
  handleMouseDown(event: MouseEvent, traceEditing: boolean): void;
  handleMouseMove(event: MouseEvent): void;
  handleMouseWheel(event: WheelEvent): void;

  resize(): void;
  render(viewport?: MapViewport): void;
}

interface IMapLoader {
  loadMapData(mapID: MapID, owner: MapStorageID): Promise<MapData | string | null>;
  abortLoading(): void;
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

/* --- --- */

interface MapViewport {
  cx: number;
  cy: number;
  scale: MapScale;
}

interface MapData {
  date: string;
  eTag: string;
  layers: IMapLayer[];
  mapCode: string;
  mapName: string;
  namedpoints: string;
  objectCode: string;
  objectName: string;
  organization: string;
  owner: MapStorageID | null;
  plastCode: string;
  plastName: string;
  points: MapPoint[];

  x?: number;
  y?: number;
  scale?: number;
  onDrawEnd?: (center: Point, scale: number) => void;
}

/** Слой карты. */
interface IMapLayer {
  readonly id: string;
  readonly displayName: string;
  readonly treePath: string[];
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

/** Координаты ограничивающего прямоугольника объекта на карте. */
interface Bounds {
  max: Point;
  min: Point;
}

interface MapPoint {
  UWID: number;
  name: string;
  x: number;
  y: number;
  attrTable: Record<string, string>;
}

/** Идентификатор карты. */
type MapID = string;
/** Идентификатор системы хранения карт. */
type MapStorageID = string;

/** Масштаб карты. */
type MapScale = number;

/** Идентификатор дополнительного объетка карты. */
type MapExtraObjectID = string;

/* --- Drawer --- */

interface MapElementDrawer<E extends MapElement = MapElement> {
  bound(e: E): Bounds;
  draw(e: Readonly<E>, options: MapDrawOptions): void;
  draft?(e: Readonly<E>, options: MapDrawOptions): void;
}

interface MapDrawOptions {
  readonly ctx: CanvasRenderingContext2D;
  readonly dotsPerMeter: number;
  readonly toMapPoint: (p: Point) => Point;
  readonly toCanvasPoint: (p: Point) => Point;
}

/* --- Map Elements --- */

/** Элемент карты. */
type MapElement = MapPolyline | MapLabel | MapSign | MapPieSlice | MapField;

/** Тип элемента карты. */
type MapElementType = 'polyline' | 'label' | 'sign' | 'pieslice' | 'field';

/* -- Polyline -- */

/** Элемент на карте типа "линия". */
interface MapPolyline extends MapElementProto {
  /** Тип элемента. */
  readonly type: 'polyline';
  /** Массив дуг. */
  arcs: PolylineArc[];
  /** Цвет обводки. */
  bordercolor: string;
  /** Ширина обводки. */
  borderwidth: number;
  /** Идентификатор штриховки (stroke-dasharray). */
  borderstyle: number;
  /** Идентификатор стиля обводки. */
  borderstyleid?: string;
  /** Код типа заливки. */
  fillname?: string;
  /** Цвет паттерна заливки. */
  fillcolor: string;
  /** Фон заливки. */
  fillbkcolor: string;

  style?: PolylineBorderStyle;
  fillStyle?: CanvasPattern | string;
}

/** Дуга линии. */
interface PolylineArc {
  /** Путь дуги линии. Набор пар координат точек: `[x1, y1, x2, y2, ...]`. */
  path: number[];
  /** Является ли дуга замкнутой. */
  closed: boolean;
}

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
  Shape: {Line?: PolylineBorderStyleLine[], Polyline?: PolylineBorderStylePolyline[]};
}

interface PolylineBorderStyleLine {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

interface PolylineBorderStylePolyline {
  points: string;
}

/* -- Label -- */

/** Элемент на карте типа "подпись". */
interface MapLabel extends MapElementProto {
  /** Тип элемента. */
  readonly type: 'label';
  /** Координата X опорной точки. */
  x: number;
  /** Координата Y опорной точки. */
  y: number;
  /** Смещение по X от опорной точки. */
  xoffset: number;
  /** Смещение по Y от опорной точки. */
  yoffset: number;
  /** Угол поворота в градусах. */
  angle: number;
  /** Текст подписи. */
  text: string;
  /** Вертикальное выравнивание. */
  halignment: MapLabelAlignment;
  /** Горизонтальное выравнивание. */
  valignment: MapLabelAlignment;
  /** Цвет текста. */
  color: string;
  /** Название шрифта. */
  fontname: string;
  /** Размер шрифта. */
  fontsize: number;
  /** Цвет фона (по умолчанию цвет вьюпорта). */
  fillbkcolor?: string;
  /** Если `true`, шрифт жирный. */
  bold?: boolean;
}

/**
 * Выравнивание подписи.
 * + `0` — горизонталь: `left`, вертикаль: `bottom`
 * + `1` — горизонталь: `center`, вертикаль: `center`
 * + `2` — горизонталь: `right`, вертикаль: `top`
 */
type MapLabelAlignment = 0 | 1 | 2;

/* -- Sign -- */

/** Элемент на карте типа "знак". */
interface MapSign extends MapElementProto {
  /** Тип элемента. */
  readonly type: 'sign';
  /** Координата знака по X. */
  x: number;
  /** Координата знака по Y. */
  y: number;
  /** Коэффициент для размера. */
  size: number;
  /** Цвет знака. */
  color: string;
  /** Код группы знаков. */
  fontname: string;
  /** Номер в группе знаков. */
  symbolcode: number;
  /** Подготовленное изображения для отрисоки. */
  img: HTMLImageElement;
}

/* -- Field -- */

/** Элемент на карте типа "поле". */
interface MapField extends MapElementProto {
  /** Тип элемента. */
  readonly type: 'field';
  /** Координата X опорной точки. */
  x: number;
  /** Координата Y опорной точки. */
  y: number;
  /** Размер поля по X. */
  sizex: number;
  /** Размер поля по Y. */
  sizey: number;
  /** Размер шага ячейки в координатах карты по X. */
  stepx: number;
  /** Размер шага ячейки в координатах карты по Y. */
  stepy: number;
  /** Сериализованные данные для построения матрицы значений. */
  data: string;
  /** Матрица значений, `null` означает отсутствие значения. */
  sourceRenderDataMatrix: Matrix;
  /** Палитра цветов для отрисовки. */
  palette: MapFieldPalette;

  lastUsedPalette: MapFieldPalette;
  deltasPalette: any[];
  preCalculatedSpectre: any;
}

interface MapFieldPalette {
  interpolated: boolean;
  level: MapFieldPaletteLevel[];
}

interface MapFieldPaletteLevel {
  color: string;
  value: number;
}

/* --- Pie Slice ---  */

/** Элемент на карте типа "сектор". */
interface MapPieSlice extends MapElementProto {
  /** Тип элемента. */
  readonly type: 'pieslice';
  /** Координата X центра окружности. */
  x: number;
  /** Координата Y центра окружности. */
  y: number;
  /** Радиус дуги. */
  radius: number;
  /** Начальный угол дуги в радианах. */
  startangle: number;
  /** Конечный угол дуги в радианах. */
  endangle: number;
  /** Цвет градиента (0: белый -> граница: color). */
  color: string;
  /** Цвет обводки. */
  bordercolor: string;
  /** Код заливки. */
  fillname?: any;
  /** Фон заливки. */
  fillbkcolor: string;
  /** Подготовленная заливка для отрисовки. */
  fillStyle?: CanvasPattern | string;
}

/** Свойства, которые может содержать любой элемент карты. */
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
