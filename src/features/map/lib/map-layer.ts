import type { MapLayerInfo } from './types.dto';
import type { MapExtraObjectLayerConfig } from '../extra-objects/types';


interface MapLayerInit {
  readonly uid: string;
  readonly name: string;
  readonly group?: string;
  readonly container?: string;
}

export class MapLayer implements IMapLayer {
  /** ID слоя карты. */
  public readonly id: string;
  /** Название слоя. */
  public readonly displayName: string;
  /** Группировка в дереве слоёв. */
  public readonly treePath: string[];

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
  private readonly container?: string;

  /** Создания слоя для данных карты. */
  public static fromInfo(info: MapLayerInfo, elements: MapElement[]): MapLayer {
    const layer = new MapLayer(info, elements, false);
    layer.bounds = info.bounds;
    layer.minScale = parseScale(info.lowscale);
    layer.maxScale = parseScale(info.highscale);
    layer.visible = info.visible ?? true;
    return layer;
  }

  /** Создание слоя для дополнительного объекта. */
  public static fromConfig(id: string, config: MapExtraObjectLayerConfig): MapLayer {
    const layer = new MapLayer({uid: id, name: config.displayName}, [], true);
    layer.bounds = {min: {x: 0, y: 0}, max: {x: 0, y: 0}};
    layer.minScale = config.minScale;
    layer.maxScale = config.maxScale;
    layer.visible = config.visible ?? true;
    return layer;
  }

  private constructor(init: MapLayerInit, elements: MapElement[], temporary: boolean) {
    this.id = init.uid;
    this.displayName = init.name;
    this.treePath = (init.group || null)?.split('\\').map(s => s.trim()) ?? [];

    this.elements = elements;
    this.elementType = elements[0]?.type ?? null;

    this.active = false;
    this.modified = false;
    this.temporary = temporary;
    this.container = init.container;
  }

  public getMinScale(): MapScale {
    return this.minScale;
  }

  public getMaxScale(): MapScale {
    return this.maxScale;
  }

  public isScaleVisible(scale: MapScale): boolean {
    return this.minScale <= scale && (this.maxScale === 0 || scale <= this.maxScale);
  }

  public setMinScale(scale: MapScale): void {
    this.minScale = scale;
  }

  public setMaxScale(scale: MapScale): void {
    this.maxScale = scale;
  }

  public toInit(): MapLayerInfo & {elements: MapElement[], modified: boolean} {
    return {
      uid: this.id, name: this.displayName, group: this.treePath.join('\\'),
      lowscale: serializeScale(this.minScale), highscale: serializeScale(this.maxScale),
      bounds: this.bounds, visible: this.visible,
      container: this.container, elements: this.elements, modified: this.modified,
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
