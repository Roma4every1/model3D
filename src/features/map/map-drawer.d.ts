/** Отрисовщик карты. */
interface MapsDrawer {
  showMap(canvas: HTMLCanvasElement, map, data: ShowMapData = {}): any
  getSignImage(fontName: string, symbolCode: number, color: string): Promise<HTMLImageElement>
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
 * + `polyline`: {@link PolylineType}
 * + `label`: {@link LabelType}
 * + `pieslice`: {@link PieSliceType}
 * */
interface MapTypes {
  namedpoint: NamedPointType,
  sign: SignType,
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
  draw(i: MapSign, options): any
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
