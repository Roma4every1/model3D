/**
 * Статус загрузки карты.
 * + `ok` — данные загружены
 * + `empty` — карты не существует
 * + `loading` — загрузка данных карты
 * + `error` — ошибка при загрузке
 */
type MapStatus = 'ok' | 'empty' | 'loading' | 'error';

interface IMapStage {
  readonly scroller: any;

  getCanvas(): MapCanvas;
  getContext(): CanvasRenderingContext2D;
  getMode(): MapModeID;
  getMapData(): MapData;
  getActiveLayer(): IMapLayer | null;
  getActiveElement(): MapElement | null;

  setCanvas(canvas: MapCanvas): void;
  setData(data: MapData): void;
  setMode(id: MapModeID): void;
  setActiveLayer(layer: IMapLayer): void;

  resize(): void;
  render(viewport?: MapViewport): void;
}

type MapCanvas = HTMLCanvasElement & {events: any, showMapFlag: any};

/** Провайдер для режима карты. */
interface MapModeProvider {
  /** Идентификатор режима. */
  readonly id: MapModeID;
  /** Стиль курсора. */
  readonly cursor: string;
  /** Если `true`, нельзя менять вьюпорт. */
  readonly blocked: boolean;

  onModeEnter?(): void;
  onModeLeave?(): void;
  onClick?(e: MouseEvent, stage: IMapStage): void;
  onWheel?(e: WheelEvent, stage: IMapStage): void;
  onMouseDown?(e: MouseEvent, stage: IMapStage): void;
  onMouseUp?(e: MouseEvent, stage: IMapStage): void;
  onMouseMove?(e: MouseEvent, stage: IMapStage): void;
  onMouseLeave?(e: MouseEvent, stage: IMapStage): void;
}

/**
 * Идентификатор режима карты.
 * + `default` — перемещение карты и выбор скважин
 * + `incl` — просмотр вертикальной проекции инклинометрии
 *
 * Общие режимы редактирования:
 * + `element-select` — выбор элемента для взаимодействия
 * + `element-drag` — перетаскивание элемента карты
 * + `element-rotate` — вращение элемента карты
 * + `element-create` — ожидание точки для создания нового элемента
 *
 * Режимы для работы с точками объектов "polyline":
 * + `line-append-point` — добавление точки в конец
 * + `line-insert-point` — добавление точки между точками
 * + `line-remove-point` — удаление точек
 * + `line-move-point` — перемещние точек
 *
 * Режимы для дополнительных объектов:
 * + `trace-edit` — редактирование трассы
 * + `selection-edit` — редактирование выборки
 * + `site-append-point` — добавление точки в конец (участок)
 * + `site-insert-point` — добавление точки между точками (участок)
 * + `site-remove-point` — удаление точек (участок)
 * + `site-move-point` — перемещние точек (участок)
 */
type MapModeID =
  | 'default' | 'incl'
  | 'element-select' | 'element-drag' | 'element-rotate' | 'element-create'
  | 'line-append-point' | 'line-insert-point' | 'line-remove-point' | 'line-move-point'
  | 'trace-edit' | 'selection-edit'
  | 'site-append-point' | 'site-insert-point' | 'site-remove-point' | 'site-move-point';

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
  onDrawEnd?: () => void;
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
  draw(e: Readonly<E>, options: MapDrawOptions): void;
  draft?(e: Readonly<E>, options: MapDrawOptions): void;
}

interface MapDrawOptions {
  readonly ctx: CanvasRenderingContext2D;
  readonly dotsPerMeter: number;
  readonly toMapPoint: (p: Point) => Point;
  readonly toCanvasPoint: (p: Point) => Point;
  readonly offsetMap?: Map<string, number>;
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
  /** Если true, фон заливки прозрачный. */
  transparent?: boolean;

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
  /** Флаг прозрачности фона. */
  transparent?: boolean;
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
  fillname: string;
  /** Фон заливки. */
  fillbkcolor: string;
  /** Если true, фон заливки прозрачный. */
  transparent: boolean;
  /** Подготовленная заливка для отрисовки. */
  fillStyle?: CanvasPattern | string;
}

/** Свойства, которые может содержать любой элемент карты. */
interface MapElementProto {
  /** Ограничивающие координаты объекта. */
  bounds: Bounds;
  /** Аттрибутивная таблица. */
  attrTable?: Record<string, string>;
  /** Выбран ли элемент в текущий момент. */
  selected?: boolean;
  /** Редактируется ли элемент в текущий момент. */
  edited?: boolean;
}
