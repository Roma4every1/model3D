type MapData = {
  date: string,
  eTag: string,
  layers: MapLayer[],
  mapCode: string,
  mapData: any,
  mapError: any[],
  mapName: string,
  namedPoints: string,
  objectCode: string,
  objectName: string,
  organization: string,
  owner: MapOwner | null,
  plastCode: string,
  plastName: string,
  pointsData: Promise<any[]>,
  points: MapPoint[],

  x: number,
  y: number,
  scale: number,
};

interface MapLayer {
  bounds: Bounds,
  container: string,
  elements: MapElement[],
  elementsData: Promise<MapElement[]>,
  group: string,
  highscale: string,
  lowscale: string,
  name: string,
  uid: string,
  version: any,
  visible?: boolean,
  modified?: boolean
}

/** Границы объекта (слоя, элемента) карты.
 * + `max: {x: number, y: number}`
 * + `min: {x: number, y: number}`
 * + `top?: number` — верхняя граница
 * + `bottom?: number` — нижняя граница
 * + `left?: number` — левая граница
 * + `right?: number` — правая граница
 * */
interface Bounds {
  max: {x: number, y: number},
  min: {x: number, y: number},
  top?: number,
  bottom?: number,
  left?: number,
  right?: number,
}

type MapPoint = {
  x: number,
  y: number,
  name: string,
  UWID: string,
  attrTable: PointAttrTable,
  selected?: boolean,
};

type PointAttrTable = {
  Project: string,
  SumDebit: string,
  SumNeft: string,
  SumObv: string,
  WORKPLAST: string,
};

type ClientPoint = {x: number, y: number};

type MapScale = number;
type MapID = string;
type MapOwner = string;

type MapDimensions = {x: number, y: number, scale: number};

/** Один из возможных типов создаваемого элемента. */
type CreatingElementType = 'polyline' | 'polygon' | 'label' | 'sign';

type MapElement = MapPolyline | MapLabel | MapSign;

interface MapPolyline extends MapElementProto {
  type: 'polyline',
  arcs: PolylineArc[],
  borderstyle: number,
  borderstyleid?: any,
  fillbkcolor: string,
  fillcolor: string,
  fillname?: any,
  bordercolor: string,
  borderwidth: number,
  legend?: any,
  img?: any,
  style?: PolylineBorderStyle,
}

interface PolylineArc {
  path: number[],
  closed: boolean,
}

interface MapLabel extends MapElementProto {
  type: 'label',
  text?: string,
  fontname: string,
  fontsize: number,
  color: string,
  halignment: number,
  valignment: number,
  x: number,
  y: number,
  xoffset: number,
  yoffset: number,
  angle: number,
}

interface MapSign extends MapElementProto {
  type: 'sign',
  color: string,
  fontname: string,
  symbolcode: number,
  img: any,
  size: number,
  x: number,
  y: number,
}

interface MapElementProto {
  bounds?: Bounds,
  attrTable?: any,
  transparent?: boolean,
  edited?: boolean,
  selected?: boolean,
}

interface SignImageProto {
  fontName: string,
  symbolCode: number,
  color: string,
}

/** Отрисовщик карты. */
interface MapsDrawer {
  checkIndex(ret, context): any;
  loadMap(map, context): any
  loadProfile(): any
  drawTrack(canvas, scale, centerx, centery, track): any
  drawContour(canvas, map, scale, centerx, centery, contour, closeContour): any
  getStocksWithinContour(canvas, map, scale, centerx, centery, contour, contourOptions): any
  getStocksWithinDrenageArea(canvas, map, scale, centerx, centery, drenageArea): any
  getDrenageAreaByWellId(wellId, map, targetLayerOptions): any
  getDrenageAreaByPoint(canvas, map, scale, centerx, centery, point, targetLayerOptions): any
  getFieldValueInPoint(canvas, map, scale, centerx, centery, point): any
  drawPoint(canvas, map, scale, centerx, centery, point): any
  highlightDrenageArea(canvas, map, scale, centerx, centery, drenageArea, styles): any
  showMap(canvas: HTMLCanvasElement, map, data: ShowMapData = {}): any

  getSignImage(fontName: string, symbolCode: number, color: string): Promise<HTMLImageElement>

  updateFieldPalette,
  Scroller: any,
}

interface ShowMapData {
  scale: MapScale,
  centerx: number,
  centery: number,
  idle?: any,
  plainDrawing?: any,
  selected?: any,
}

/** ## Типы отрисовщика:
 * + `namedpoint`: {@link NamedPointType}
 * + `sign`: {@link SignType}
 * + `field`: {@link FieldType}
 * + `polyline`: {@link PolylineType}
 * + `label`: {@link LabelType}
 * + `pieslice`: {@link PieSliceType}
 * */
interface MapTypes {
  namedpoint: NamedPointType,
  sign: SignType,
  field: FieldType,
  polyline: PolylineType,
  label: LabelType,
  pieslice: PieSliceType,
}

interface NamedPointType {
  name: 'namedpoint';

  bound(point: ClientPoint): Bounds
  draft(i, options): void
}

interface SignType {
  name: 'sign';

  bound(point: ClientPoint): Bounds
  loaded(i: MapSign, provider): void
  draft_(i: MapSign, options): void
  draw(i: MapSign, options): any
}

interface FieldType {
  name: 'field';
  sourceRenderDataMatrix: any;
  deltasPalette: any;
  lastUsedScale: any;
  lastUsedRenderDataMatrix: any;
  lastUsedImageData: any;
  calculationTimer: any;

  bound(p: any): Bounds
  loaded(i): void
  draw(i, options): Generator
  getFieldValueInPoint (i, point, options): any
  getStocksWithinContour(i, options): any
  updatePalette(i, newPalette): void

  _getVisiblePartOfField(sourceRenderDataMatrix, fieldBounds, drawBounds): any
  _getIntersectionStartPercent(fieldBounds, drawBounds, dimension): any
  _getIntersectionEndPercent(fieldBounds, drawBounds, dimension): any
  _parseSourceRenderData(stringData): any
  _getRgbPaletteFromHex(hexPalette): object
  _getDeltasPalette(palette): any
  _interpolateArray(data, fitCount): any
  _linearInterpolate(before: number, after: number, atPoint: number): number
  _getPaletteDeltaForValue(value, deltasPalette): any
  _getRenderArrayFromData(renderData, sizex, sizey, deltasPalette): any[]
  _draw(i, options): void
}

interface PolylineType {
  name: 'polyline';
  borderStyles: string[];
  styleShapes: {[key: string]: number[]};

  getPattern(name: string, color: string, backColor: string): Promise<any>
  bkcolor(i: MapPolyline): string
  bound(p: any): Bounds
  loaded(i: MapPolyline, provider): any
  points(i: MapPolyline, options): void
  path(i: MapPolyline, options): void
  decorationPath(i: Partial<MapPolyline>, options, lineConfig): void
  draft(i: MapPolyline, options): void
  draw(i: MapPolyline, options): any
}

interface LabelType {
  name: 'label';
  alHorLeft: number;
  alHorCenter: number;
  alHorRight: number;
  alVerBottom: number;
  alVerCenter: number;
  alVerTop: number;

  bound(point: ClientPoint): Bounds
  draw(i: MapLabel, options): Generator
}

interface PieSliceType {
  name: 'pieslice';

  bound(point: ClientPoint): Bounds
  draw(i, options): Generator
}

interface PolylineBorderStyle {
  guid: {_value: string},
  name: {_value: string},
  baseColor?: {_value: string},
  baseThickness?: {_value: number},
  Decoration?: BorderStyleDecoration[],
  StrokeDashArrays?: {StrokeDashArray: StrokeDashArray[]}[],
}

interface BorderStyleDecoration {
  initialInterval: {_value: number},
  interval: {_value: number},
  offsetX: {_value: number},
  offsetY: {_value: number},
  thickness?: {_value: number}
  Shape: {
    Line?: ShapeLine[],
    Polyline?: any[],
  }[],
}

interface StrokeDashArray {
  data: {_value: string},
  onBase: {_value: boolean},
  color?: {_value: string},
  _text: any[]
}

interface ShapeLine {
  x1: {_value: number},
  x2: {_value: number},
  y1: {_value: number},
  y2: {_value: number},
}
