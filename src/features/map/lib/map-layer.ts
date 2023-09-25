export class MapLayer implements IMapLayer {
  /** ID слоя карты. */
  public readonly id: string;
  /** Группировка в дереве слоёв. */
  public readonly group: string;
  /** Название слоя. */
  public readonly displayName: DisplayName;
  /** Тип элементов слоя. */
  public readonly elementType: MapElementType;

  /** Минимальные и максимальные координаты элементов. */
  public bounds: Bounds;
  /** Элементы на текущем слое. */
  public elements: MapElement[];

  /** Является ли слой видимым. */
  public visible: boolean;
  /** Является ли слой активным. */
  public active: boolean = false;
  /** Был ли слой изменён. */
  public modified: boolean = false;
  /** Является ли слой временным (для трасс). */
  private readonly temporary: boolean;

  /** Минимальный масштаб при котором слой будет рисоваться. */
  private minScale: number;
  /** Максимальный масштаб при котором слой будет рисоваться. */
  private maxScale: number;

  /* --- --- */

  /** Версия контейнера. */
  private readonly version: any;
  /** ID контейнера карты. */
  private readonly container: string;
  private readonly index: any;

  constructor(init: MapLayerRaw, elements: MapElement[], temporary: boolean = false) {
    this.id = init.uid;
    this.group = init.group;
    this.displayName = init.name;
    this.elementType = elements[0]?.type ?? 'polyline';

    this.bounds = init.bounds;
    this.elements = elements;

    this.minScale = parseScale(init.lowscale);
    this.maxScale = parseScale(init.highscale);
    this.visible = init.visible;
    this.temporary = temporary;

    this.version = init.version;
    this.container = init.container;
    this.index = init.index;
  }

  public getMinScale(): number {
    return this.minScale;
  }

  public getMaxScale(): number {
    return this.maxScale;
  }

  public isScaleVisible(scale: MapScale): boolean {
    return this.minScale <= scale && scale <= this.maxScale;
  }

  public isTemporary(): boolean {
    return this.temporary;
  }

  public setMinScale(scale: number): void {
    this.minScale = scale;
  }

  public setMaxScale(scale: number): void {
    this.maxScale =scale;
  }

  public toInit(): any {
    return {
      group: this.group, name: this.displayName, elements: this.elements,
      uid: this.id, version: this.version, container: this.container, index: this.index,
      lowscale: serializeScale(this.minScale), highscale: serializeScale(this.maxScale),
    };
  }
}

function parseScale(value: number | string): number {
  if (typeof value === 'string') {
    if (value === 'INF') return Infinity;
    const scale = parseInt(value);
    return isNaN(scale) ? 0 : scale;
  } else {
    return isNaN(value) ? 0 : value;
  }
}

function serializeScale(scale: number): string {
  if (scale === Infinity) return 'INF';
  return scale.toString();
}
