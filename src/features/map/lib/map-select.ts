import { checkDistance, checkDistancePoints } from './selecting-utils';


export class MapSelect implements IMapSelect {
  public onlyActiveLayer: boolean;
  public types: Record<MapElementType, boolean>;

  public lastPoint: Point | null = null;
  private nearestElements: MapElement[];
  private index: number;
  private textMeasurer: (text: string) => number;

  constructor() {
    this.index = 0;
    this.nearestElements = [];
    this.onlyActiveLayer = false;
    this.types = {sign: true, polyline: true, label: true, field: true, pieslice: true};
  }

  public setTextMeasurer(measurer: (text: string) => number) {
    this.textMeasurer = measurer;
  }

  public findElement(point: Point, layers: IMapLayer[], activeLayer: IMapLayer, scale: MapScale): MapElement | null {
    if (checkDistancePoints(this.lastPoint, point, scale)) {
      if (this.nearestElements.length === 0) return null;
      this.index++;

      if (this.index < this.nearestElements.length) {
        return this.nearestElements[this.index];
      } else {
        this.index = -1;
        return null;
      }
    }

    this.nearestElements = [];
    const filterFn = (element) => checkDistance(element, point, scale, this.textMeasurer);

    if (this.onlyActiveLayer && activeLayer) {
      if (activeLayer.isScaleVisible(scale)) {
        this.nearestElements = activeLayer.elements.filter(filterFn);
      }
    } else {
      for (const layer of layers) {
        if (!layer.visible || layer.temporary || !this.types[layer.elementType]) continue;
        if (layer.isScaleVisible(scale)) this.nearestElements.push(...layer.elements.filter(filterFn));
      }
    }

    if (this.nearestElements.length === 0) { this.lastPoint = null; return null; }
    this.nearestElements.reverse();
    this.lastPoint = point;
    this.index = 0;
    return this.nearestElements[0];
  }

  public clear(): void {
    this.nearestElements = [];
    this.index = 0;
    this.lastPoint = null;
  }
}
