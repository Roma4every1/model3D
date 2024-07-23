/** ## Типы отрисовщика:
 * + `namedpoint`: {@link NamedPointType}
 * + `sign`: {@link SignType}
 * + `polyline`: {@link PolylineType}
 * + `label`: {@link LabelType}
 * + `pieslice`: {@link PieSliceType}
 * */
interface MapTypes {
  namedpoint: NamedPointType;
  sign: SignType;
  polyline: PolylineType;
  label: LabelType;
  pieslice: PieSliceType;
}

interface NamedPointType {
  name: 'namedpoint';

  bound(point: Point): Bounds;
  draft(i, options): void;
}

interface SignType {
  name: 'sign';

  bound(point: Point): Bounds;
  loaded(i: MapSign, provider): void;
  draw(i: MapSign, options): void;
}

interface PolylineType {
  name: 'polyline';
  borderStyles: string[];
  styleShapes: {[key: string]: number[]};

  getPattern(name: string, color: string, backColor: string): Promise<any>;
  bkcolor(i: MapPolyline): string;
  bound(p: any): Bounds;
  loaded(i: MapPolyline, provider): any;
  points(i: MapPolyline, options): void;
  path(i: MapPolyline, options): void;
  decorationPath(i: Partial<MapPolyline>, options, lineConfig): void;
  draft(i: MapPolyline, options): void;
  draw(i: MapPolyline, options): Promise<void>;
}

interface LabelType {
  name: 'label';
  alHorLeft: number;
  alHorCenter: number;
  alHorRight: number;
  alVerBottom: number;
  alVerCenter: number;
  alVerTop: number;

  bound(point: Point): Bounds;
  draw(i: MapLabel, options): void;
}

interface PieSliceType {
  name: 'pieslice';

  bound(point: Point): Bounds;
  draw(i: MapPieSlice, options): void;
}
