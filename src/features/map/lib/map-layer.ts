import type { MapLayerInfo } from './types';


export class MapLayer implements IMapLayer {
  /** ID слоя карты. */
  public readonly id: string;
  /** Группировка в дереве слоёв. */
  public readonly group: string;
  /** Название слоя. */
  public readonly displayName: string;

  /** Элементы на текущем слое. */
  public elements: MapElement[];
  /** Тип элементов слоя. */
  public readonly elementType: MapElementType;
  /** Минимальные и максимальные координаты элементов. */
  public bounds: Bounds;

  /** Минимальный масштаб при котором слой будет рисоваться. */
  private minScale: number;
  /** Максимальный масштаб при котором слой будет рисоваться. */
  private maxScale: number;
  /** Является ли слой видимым. */
  public visible: boolean;

  /** Является ли слой активным. */
  public active: boolean;
  /** Был ли слой изменён. */
  public modified: boolean;
  /** Является ли слой временным (для трасс). */
  public readonly temporary: boolean;
  /** ID контейнера карты. */
  private readonly container: string;

  constructor(info: MapLayerInfo, elements: MapElement[], temporary: boolean = false) {
    this.id = info.uid;
    this.group = info.group;
    this.displayName = info.name;

    this.elements = elements;
    this.elementType = elements[0]?.type ?? 'polyline';
    this.bounds = info.bounds;

    this.minScale = parseScale(info.lowscale);
    this.maxScale = parseScale(info.highscale);
    this.visible = info.visible;

    this.active = false;
    this.modified = false;
    this.temporary = temporary;
    this.container = info.container;
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

  public setMinScale(scale: number): void {
    this.minScale = scale;
  }

  public setMaxScale(scale: number): void {
    this.maxScale = scale;
  }

  public toInit(): MapLayerInfo & {elements: MapElement[], modified: boolean} {
    return {
      uid: this.id, name: this.displayName, group: this.group,container: this.container,
      lowscale: serializeScale(this.minScale), highscale: serializeScale(this.maxScale),
      bounds: this.bounds, visible: this.visible,
      elements: this.elements, modified: this.modified,
    };
  }
}

function parseScale(value: string): number {
  if (value === 'INF') return Infinity;
  const scale = Number(value);
  if (Number.isNaN(scale) || scale < 0) return 0;
  return scale;
}

function serializeScale(scale: number): string {
  if (scale === Infinity) return 'INF';
  return scale.toString();
}
