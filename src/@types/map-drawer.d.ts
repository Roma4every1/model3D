/** Отрисовщик карты. */
interface MapsDrawer {
  provider: any,

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
  changeOwner(owner: MapOwner): void
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
