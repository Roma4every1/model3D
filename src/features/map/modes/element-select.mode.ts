import { MapStage } from '../lib/map-stage';

import {
  checkDistancePoints, selectElement, unselectElement,
  checkDistanceForPolygon, checkDistanceForPolyline,
  checkDistanceForLabel, checkDistanceForPieSlice, checkDistanceForField
} from '../lib/selecting-utils';


export class ElementSelectModeProvider implements MapModeProvider {
  public readonly id = 'element-select';
  public readonly cursor = 'default';
  public readonly blocked = false;

  public readonly types: Record<MapElementType, boolean>;
  public onlyActiveLayer: boolean;

  private nearestElements: MapElement[];
  private index: number;
  private lastPoint: Point | null;

  constructor() {
    this.nearestElements = [];
    this.index = 0;
    this.lastPoint = null;
    this.onlyActiveLayer = false;
    this.types = {sign: true, polyline: true, label: true, field: true, pieslice: true, image: false};
  }

  public onModeLeave(): void {
    this.clear();
  }

  public onClick(e: MouseEvent, stage: MapStage): void {
    const oldElement = stage.getActiveElement();
    const newElement = this.findElement(stage.eventToPoint(e), stage);

    if (oldElement) unselectElement(oldElement);
    if (newElement) selectElement(newElement);

    stage.setActiveElement(newElement);
    stage.render();
  }

  /* --- --- */

  public setTypeSelect(type: MapElementType, select: boolean): void {
    this.types[type] = select;
    this.clear();
  }

  public setActiveLayerSelect(select: boolean): void {
    this.onlyActiveLayer = select;
    this.clear();
  }

  private clear(): void {
    this.nearestElements = [];
    this.index = 0;
    this.lastPoint = null;
  }

  private findElement(point: Point, stage: MapStage): MapElement | null {
    const activeLayer = stage.getActiveLayer();
    const context = stage.getContext();
    const { scale, layers } = stage.getMapData();

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

    if (this.onlyActiveLayer && activeLayer) {
      if (activeLayer.isScaleVisible(scale)) {
        this.findNearestElements(point, scale, activeLayer, context);
      }
    } else {
      for (const layer of layers) {
        if (!layer.visible || layer.temporary || !this.types[layer.elementType]) continue;
        if (layer.isScaleVisible(scale)) this.findNearestElements(point, scale, layer, context);
      }
    }

    if (this.nearestElements.length === 0) { this.lastPoint = null; return null; }
    this.nearestElements.reverse();
    this.lastPoint = point;
    this.index = 0;
    return this.nearestElements[0];
  }

  private findNearestElements(point: Point, scale: MapScale, layer: IMapLayer, ctx: CanvasRenderingContext2D): void {
    switch (layer.elementType) {
      case 'polyline': {
        for (const polyline of layer.elements as MapPolyline[]) {
          const near = polyline.fillbkcolor && !polyline.transparent
            ? checkDistanceForPolygon(polyline, point, scale)
            : checkDistanceForPolyline(polyline, point, scale);
          if (near) this.nearestElements.push(polyline);
        }
        break;
      }
      case 'sign': {
        for (const sign of layer.elements as MapSign[]) {
          if (checkDistancePoints(sign, point, scale)) this.nearestElements.push(sign);
        }
        break;
      }
      case 'label': {
        for (const label of layer.elements as MapLabel[]) {
          if (checkDistanceForLabel(label, point, scale, ctx)) this.nearestElements.push(label);
        }
        break;
      }
      case 'pieslice': {
        for (const pie of layer.elements as MapPieSlice[]) {
          if (checkDistanceForPieSlice(pie, point, scale)) this.nearestElements.push(pie);
        }
        break;
      }
      case 'field': {
        for (const field of layer.elements as MapField[]) {
          if (checkDistanceForField(field, point)) this.nearestElements.push(field);
        }
        break;
      }
    }
  }
}
