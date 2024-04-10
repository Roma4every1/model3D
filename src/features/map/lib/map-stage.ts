import { canCreateTypes, MapMode } from './constants.ts';
import { MapSelect } from './map-select.ts';
import { MapLayer } from './map-layer.ts';
import { Scroller } from '../drawer/scroller.ts';

import { showMap } from '../drawer/maps.js';
import { getDefaultMapElement } from '../components/edit-panel/editing/editing-utils.ts';
import { selectElement, unselectElement } from './selecting-utils.ts';

import {
  createMapElementInit,
  getBoundsByPoints,
  getNearestPointIndex,
  PIXEL_PER_METER
} from './map-utils.ts';

import {
  applyMouseDownActionToPolyline,
  applyMouseMoveActionToElement,
  applyRotateToLabel,
} from '../components/edit-panel/editing/edit-element-utils.ts';
import {PluginNames} from './map-plugins/lib/constants.ts';
import {
  InclinometryModePlugin
} from './map-plugins/plugins/inclinometry-mode-plugin/inclinometry-mode-plugin.ts';


export class MapStage implements IMapStage {
  /** Класс управления состоянием выделения. */
  public readonly select: MapSelect;
  /** Слушатели событий сцены. */
  public readonly listeners: MapStageListeners;
  /** Scroller. */
  public readonly scroller: Scroller;
  /** Активен ли режим редактирования трассы. */
  public traceEditing: boolean = false;

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

  /** Зарегистрированные плагины карты. */
  public plugins: IMapPlugin[] = [];
  /** Включен ли режим инклинометрии. */
  public inclinometryModeOn: boolean = false;

  constructor(plugins: IMapPlugin[] = []) {
    this.plugins = plugins;
    this.inclinometryModeOn = plugins.some(it => it?.inclinometryModeOn);
    this.select = new MapSelect();
    this.scroller = new Scroller();

    this.listeners = {
      layerTreeChange: () => {}, navigationPanelChange: () => {},
      selectPanelChange: () => {}, editPanelChange: () => {},
    };
  }

  public getCanvas(): MapCanvas {
    return this.canvas;
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
    const layers = this.data.layers.filter(l => !l.temporary).map(l => l.toInit());
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

  /** Перевод координат канваса в координаты карты. */
  public eventToPoint(event: MouseEvent): Point {
    if (!this.canvas || !this.data?.x) return {x: event.offsetX, y: event.offsetY};
    const sc = this.data.scale / PIXEL_PER_METER;
    const canvasCenterX = this.canvas.clientWidth / 2;
    const canvasCenterY = this.canvas.clientHeight / 2;

    return {
      x: this.data.x + (event.offsetX - canvasCenterX) * sc,
      y: this.data.y + (event.offsetY - canvasCenterY) * sc
    };
  }

  public setCanvas(canvas: MapCanvas): void {
    this.canvas = canvas;
    if (!canvas) return;
    this.scroller.setCanvas(canvas);
    this.plugins.forEach(p => p.setCanvas(canvas))
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
    const edited = mode > MapMode.MOVE_MAP;
    if (edited) this.startEditing();

    this.canvas.blocked = mode !== MapMode.MOVE_MAP;
    this.canvas.style.cursor = mode === MapMode.AWAIT_POINT ? 'crosshair' : 'auto';

    if (this.activeElement?.type === 'polyline' && this.activeElement.edited !== edited) {
      this.activeElement.edited = edited;
      this.render();
    }
    this.listeners.editPanelChange();
    this.listeners.navigationPanelChange();
  }

  public setSelecting(selecting: boolean): void {
    if (selecting === this.selecting) return;
    if (!selecting && this.activeElement) {
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

    if (this.activeElement) {
      this.clearSelect(); this.render();
    }
    this.setMode(MapMode.AWAIT_POINT);
    this.listeners.selectPanelChange();
  }

  public startEditing(): void {
    if (this.editing || this.creating) return;
    this.editing = true;
    this.elementInit = createMapElementInit(this.activeElement);

    if (this.activeElement.type === 'polyline') {
      this.activeElement.edited = this.mode > MapMode.MOVE_MAP;
    } else {
      this.activeElement.edited = true;
    }
    this.listeners.selectPanelChange();
    this.render();
  }

  public accept(): void {
    if (!this.activeElement) return;
    if (this.activeElement.type === 'polyline') {
      this.activeElement.bounds = getBoundsByPoints(this.activeElement.arcs[0].path);
    }

    this.getActiveElementLayer().modified = true;
    unselectElement(this.activeElement);
    this.activeElement = null;
    this.clearSelect();

    if (this.creating) {
      this.setMode(MapMode.AWAIT_POINT);
    } else {
      this.canvas.blocked = false;
      this.editing = false;
      this.creating = false;
      this.elementInit = null;
      this.mode = MapMode.MOVE_MAP;
      this.listeners.navigationPanelChange();
      this.listeners.editPanelChange();
    }
    this.listeners.selectPanelChange();
  }

  public cancel(): void {
    this.listeners.selectPanelChange();
    if (!this.activeElement) {
      if (!this.creating) return;
      this.creating = false;
      this.setMode(MapMode.MOVE_MAP);
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
    this.listeners.navigationPanelChange();
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

  /* --- Handlers --- */

  public handleMouseDown(event: MouseEvent): void {
    this.scroller.mouseDown(event);
    if (this.editing || this.creating) {
      this.isOnMove = this.mode === MapMode.MOVE
        || this.mode === MapMode.MOVE_POINT || this.mode === MapMode.ROTATE;

      if (this.activeElement?.type !== 'polyline') return;
      const scale = this.data.scale;
      const point = this.eventToPoint(event);

      if (this.mode === MapMode.MOVE_POINT) {
        this.pIndex = getNearestPointIndex(point, scale, this.activeElement);
      }
      const path = this.activeElement.arcs[0].path;
      const oldPathLength = path.length;
      applyMouseDownActionToPolyline(this.activeElement, {mode: this.mode, point, scale});

      if (path.length !== oldPathLength) this.listeners.editPanelChange();
      this.render();
    } else if (this.selecting && !this.traceEditing) {
      const point = this.eventToPoint(event);
      this.handleSelectChange(point);
    }
  }

  public handleMouseUp(event: MouseEvent): MapElement | null {
    if (this.inclinometryModeOn) {
      const inclPlugin = this.plugins.find(it =>
        it.name === PluginNames.INCLINOMETRY_MODE
      ) as InclinometryModePlugin;
      inclPlugin.handleInclinometryAngleChange({x: event.offsetX * 2, y: event.offsetY * 2});
      return;
    }
    this.scroller.mouseUp();
    this.isOnMove = false;
    this.pIndex = null;

    if (this.mode !== MapMode.AWAIT_POINT || !this.activeLayer) return null;
    const creatingType = this.activeLayer?.elementType;
    if (!canCreateTypes.includes(creatingType)) return null;

    const point = this.eventToPoint(event);
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);

    const newElement = getDefaultMapElement(creatingType, point);
    this.activeLayer.elements.push(newElement);

    const maxScale = this.activeLayer.getMaxScale();
    if (this.data.scale > maxScale) {
      this.data.x = point.x;
      this.data.y = point.y;
      this.data.scale = maxScale;
    }

    this.setActiveElement(newElement);
    this.render();
    return newElement;
  }

  public handleMouseMove(event: MouseEvent): void {
    this.scroller.mouseMove(event);
    if (!this.isOnMove) return;
    const point = this.eventToPoint(event);
    const action = {mode: this.mode, point, pIndex: this.pIndex};
    applyMouseMoveActionToElement(this.activeElement, action);
    this.render();
  }

  public handleMouseWheel(event: WheelEvent): void {
    if (this.inclinometryModeOn) return;
    this.scroller.wheel(event);
    this.select.lastPoint = null;
    if (this.mode !== MapMode.ROTATE || !(this.activeElement?.type === 'label')) return;
    applyRotateToLabel(this.activeElement, event.deltaY > 0, event.shiftKey);
    this.render();
  }

  /* --- Drawing --- */

  public resize(): void {
    // this.drawData ? this.drawData.update(this.canvas) : this.render();
    this.render();
    this.plugins.forEach(p => p.setCanvas(this.canvas));
  }

  public render(viewport?: MapViewport): void {
    if (!this.canvas || !this.data) return;
    if (!viewport) {
      // if (this.data.x === undefined) return;
      viewport = {centerX: this.data.x, centerY: this.data.y, scale: this.data.scale};
    }
    if (this.drawData) this.drawData.detach();
    const afterUpdate = () => this.plugins.forEach(p => p.render());
    this.drawData = showMap(this.canvas, this.data, viewport, afterUpdate);
  }

  /* --- Private --- */

  private handleSelectChange(point: Point): void {
    if (this.inclinometryModeOn) return;
    const scale = this.data.scale;
    const newElement = this.select.findElement(point, this.data.layers, this.activeLayer, scale);

    if (this.activeElement) {
      unselectElement(this.activeElement);
      this.activeElement.edited = false;
    }
    if (newElement) selectElement(newElement);
    this.setActiveElement(newElement);
    this.render();
  }

  private setActiveElement(element: MapElement | null): void {
    if (this.activeElement === element) return;
    this.listeners.editPanelChange();
    this.activeElement = element;
  }
}
