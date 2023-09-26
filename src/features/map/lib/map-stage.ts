import { canCreateTypes, MapMode } from './constants.ts';
import { MapSelect } from './map-select.ts';
import { MapLayer } from './map-layer.ts';
import { Scroller } from '../drawer/scroller.ts';

import { showMap } from '../drawer/maps.js';
import { getDefaultMapElement } from '../components/edit-panel/editing/editing-utils.ts';
import { selectElement, unselectElement } from './selecting-utils.ts';
import {
  clientPoint,
  createMapElementInit,
  getBoundsByPoints,
  getNearestPointIndex
} from './map-utils.ts';

import {
  applyMouseDownActionToPolyline,
  applyMouseMoveActionToElement,
  applyRotateToLabel,
} from '../components/edit-panel/editing/edit-element-utils.ts';


export class MapStage implements IMapStage {
  /** Класс управления состоянием выделения. */
  public readonly select: MapSelect;
  /** Слушатели событий сцены. */
  public readonly listeners: MapStageListeners;
  /** Функция перевода координат канваса в координаты карты. */
  public pointToMap: (point: Point) => Point;

  private readonly scroller: Scroller;
  private data: MapData = null;
  private canvas: MapCanvas = null;
  private drawData: any = null;

  /** Режим редактирования карты. */
  private mode: MapMode = MapMode.MOVE_MAP;
  /** Активный слой. */
  private activeLayer: MapLayer = null;
  /** Активный элемент карты. */
  private activeElement: MapElement = null;
  /** Начальные свойства активного элемента. */
  private elementInit: MapElement = null;

  /** Активен ли режим выделения на карте. */
  private selecting: boolean = false;
  /** Находится ли карта в состоянии редактирования. */
  private editing: boolean = false;
  /** Находится ли карта в состоянии создания нового элемента. */
  private creating: boolean = false;

  private isOnMove: boolean = false;
  private pIndex: number = null;

  constructor() {
    this.select = new MapSelect();
    this.scroller = new Scroller();

    this.listeners = {
      layerTreeChange: () => {},
      selectPanelChange: () => {}, editPanelChange: () => {},
      propertyWindowClose: () => {}, attrTableWindowClose: () => {},
    };
    this.pointToMap = (p) => p;
  }

  public getMode(): MapMode {
    return this.mode;
  }

  public getSelecting(): boolean {
    return this.selecting;
  }

  public getMapData(): MapData {
    return this.data;
  }

  public getMapDataToSave(): any {
    const layers = this.data.layers.filter(l => !l.isTemporary()).map(l => l.toInit());
    return {
      ...this.data, layers,
      x: undefined, y: undefined, scale: undefined, onDrawEnd: undefined,
    };
  }

  public getActiveLayer(): MapLayer {
    return this.activeLayer;
  }

  public getActiveElement(): MapElement | null {
    return this.activeElement;
  }

  public getActiveElementLayer(): IMapLayer | null {
    if (!this.activeElement) return null;
    return this.data.layers.find(l => l.elements.includes(this.activeElement));
  }

  public isElementEditing(): boolean {
    return this.editing;
  }

  public isElementCreating(): boolean {
    return this.creating;
  }

  public setCanvas(canvas: MapCanvas): void {
    this.canvas = canvas;
    if (!canvas) return;
    this.scroller.setCanvas(canvas);
    this.scroller.setList([canvas]);
    const ctx = canvas.getContext('2d');
    this.select.setTextMeasurer(text => ctx.measureText(text).width);
  }

  public setData(data: MapData): void {
    this.data = data;
    this.activeLayer = null;
  }

  public setMode(mode: MapMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    if (mode > MapMode.MOVE_MAP) this.startEditing();

    this.canvas.blocked = mode !== MapMode.MOVE_MAP;
    this.canvas.style.cursor = mode === MapMode.AWAIT_POINT ? 'crosshair' : 'auto';
    this.setSelecting(false, false);
    this.listeners.editPanelChange();
  }

  public setSelecting(selecting: boolean, clearSelect: boolean = true): void {
    if (selecting === this.selecting) return;
    if (clearSelect && !selecting && this.activeElement) {
      this.clearSelect(); this.render();
    }
    if (selecting && this.editing) {
      this.cancel(); this.render();
    }
    this.selecting = selecting;
    this.listeners.selectPanelChange();
  }

  public setActiveLayer(layer: MapLayer): void {
    if (this.activeLayer === layer) return;
    if (this.creating || this.editing) this.cancel();
    this.activeLayer = layer;
    this.data.layers.forEach(l => { l.active = false; });
    if (layer) layer.active = true;
    this.listeners.editPanelChange();
    this.listeners.layerTreeChange();
  }

  public startCreating(): void {
    if (this.creating) return;
    this.creating = true;
    this.setSelecting(false);
    this.setMode(MapMode.AWAIT_POINT);
    this.listeners.selectPanelChange();
  }

  public startEditing(): void {
    if (this.editing || this.creating) return;
    this.editing = true;
    this.activeElement.edited = true;
    this.elementInit = createMapElementInit(this.activeElement);
  }

  public accept(): void {
    if (!this.activeElement) return;
    if (this.activeElement.type === 'polyline') {
      this.activeElement.bounds = getBoundsByPoints(this.activeElement.arcs[0].path);
    }

    this.getActiveElementLayer().modified = true;
    this.activeElement = null;
    this.listeners.editPanelChange();
    this.clearSelect();

    this.canvas.blocked = false;
    this.editing = false;
    this.creating = false;
    this.elementInit = null;
    this.mode = MapMode.MOVE_MAP;
  }

  public cancel(): void {
    if (!this.activeElement) {
      if (!this.creating) return;
      this.creating = false;
      this.setMode(MapMode.MOVE_MAP);
      this.listeners.selectPanelChange();
      return;
    }
    if (this.creating) {
      this.activeLayer.elements.pop();
    } else {
      for (const field in this.elementInit) {
        this.activeElement[field] = this.elementInit[field];
      }
      this.elementInit = null;
    }
    this.creating = false;
    this.editing = false;
    this.mode = MapMode.MOVE_MAP;
    this.clearSelect();
    this.render();
  }

  public clearSelect(): void {
    this.select.clear();
    this.canvas.blocked = false;
    this.editing = false;
    if (this.activeElement) unselectElement(this.activeElement);
    this.setActiveElement(null);
  }

  public deleteActiveElement(): void {
    if (!this.activeElement) return;
    for (const layer of this.data.layers) {
      const index = layer.elements.indexOf(this.activeElement);
      if (index !== -1) {
        layer.elements.splice(index, 1);
        layer.modified = true; break;
      }
    }
    this.setActiveElement(null);
  }

  private setActiveElement(element: MapElement | null): void {
    if (this.activeElement === element) return;
    this.listeners.editPanelChange();
    this.listeners.propertyWindowClose();
    this.listeners.attrTableWindowClose();
    this.activeElement = element;
  }

  /* --- Handlers --- */

  public handleMouseDown(event: MouseEvent): void {
    this.scroller.mouseDown(event);
    if (this.selecting) {
      const scale = this.data.scale;
      const point = this.pointToMap(clientPoint(event));
      const newElement = this.select.findElement(point, this.data.layers, this.activeLayer, scale);

      if (this.activeElement) {
        unselectElement(this.activeElement);
        this.activeElement.edited = false;
      }
      if (newElement) selectElement(newElement);
      this.setActiveElement(newElement);
      this.render();
    } else {
      if (!this.editing && !this.creating) return;
      this.isOnMove = this.mode === MapMode.MOVE
        || this.mode === MapMode.MOVE_POINT || this.mode === MapMode.ROTATE;

      if (this.activeElement?.type !== 'polyline') return;
      const scale = this.data.scale;
      const point = this.pointToMap(clientPoint(event));

      if (this.mode === MapMode.MOVE_POINT) {
        this.pIndex = getNearestPointIndex(point, scale, this.activeElement);
      }
      const len = this.activeElement.arcs[0].path.length;
      applyMouseDownActionToPolyline(this.activeElement, {mode: this.mode, point, scale});
      if (len !== this.activeElement.arcs[0].path.length) this.listeners.editPanelChange();
      this.render();
    }
  }

  public handleMouseUp(event: MouseEvent): MapElement | null {
    this.scroller.mouseUp(event);
    this.isOnMove = false;
    this.pIndex = null;

    if (this.mode !== MapMode.AWAIT_POINT || !this.activeLayer) return null;
    const creatingType = this.activeLayer?.elementType;
    if (!canCreateTypes.includes(creatingType)) return null;

    const point = this.pointToMap(clientPoint(event));
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);

    const newElement = getDefaultMapElement(creatingType, point);
    this.activeLayer.elements.push(newElement);
    this.setActiveElement(newElement);
    this.render();
    return newElement;
  }

  public handleMouseMove(event: MouseEvent): void {
    this.scroller.mouseMove(event);
    if (!this.isOnMove) return;
    const point = this.pointToMap(clientPoint(event));
    const action = {mode: this.mode, point, pIndex: this.pIndex};
    applyMouseMoveActionToElement(this.activeElement, action);
    this.render();
  }

  public handleMouseWheel(event: WheelEvent): void {
    this.scroller.wheel(event);
    this.select.lastPoint = null;
    if (this.mode !== MapMode.ROTATE || !(this.activeElement?.type === 'label')) return;
    applyRotateToLabel(this.activeElement, event.deltaY > 0, event.shiftKey);
    this.render();
  }

  /* --- Drawing --- */

  public resize(): void {
    this.drawData ? this.drawData.update(this.canvas) : this.render();
  }

  public render(viewport?: MapViewport): void {
    if (!this.canvas || !this.data) return;
    if (!viewport) {
      if (this.data.x === undefined) return;
      viewport = {centerX: this.data.x, centerY: this.data.y, scale: this.data.scale};
    }
    if (this.drawData) this.drawData.detach();
    this.drawData = showMap(this.canvas, this.data, viewport);
  }
}
