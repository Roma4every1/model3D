import type { MapEventMap, MapEventKind } from './types';
import type { MapExtraObjectState, MapExtraObjectConfig } from '../extra-objects/types';
import { EventBus } from 'shared/lib';
import { MapLayer } from './map-layer';
import { Scroller } from '../drawer/scroller';
import { showMap } from '../drawer/maps';
import { unselectElement } from './selecting-utils';
import { getTotalBounds, getMapElementBounds } from './bounds';
import { pixelPerMeter } from './constants';


/** Сцена карты. */
export class MapStage implements IMapStage {
  /** Класс для обработки вьюпорта при движении. */
  public readonly scroller: Scroller;
  /** Шина событий для сцены. */
  private readonly eventBus: EventBus<MapEventKind, MapEventMap>;
  /** Режимы карты. */
  private readonly modes: Map<MapModeID, MapModeProvider>;
  /** Дополнительные объекты. */
  private readonly extraObjects: Map<MapExtraObjectID, MapExtraObjectState>;

  /** Активный режим. */
  private mode: MapModeProvider = null;
  /** Активный слой. */
  private activeLayer: MapLayer = null;
  /** Активный элемент карты. */
  private activeElement: MapElement = null;

  private data: MapData = null;
  private ctx: CanvasRenderingContext2D;
  private detach: () => void;

  constructor() {
    this.scroller = new Scroller();
    this.eventBus = new EventBus();
    this.modes = new Map();
    this.extraObjects = new Map();
  }

  public subscribe<T extends MapEventKind>(e: T, cb: EventCallback<MapEventMap[T]>): void {
    this.eventBus.subscribe(e, cb);
  }
  public unsubscribe<T extends MapEventKind>(e: T, cb: EventCallback<MapEventMap[T]>): void {
    this.eventBus.unsubscribe(e, cb);
  }

  /* --- --- */

  public getCanvas(): MapCanvas {
    return this.ctx?.canvas as MapCanvas;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getMapData(): MapData {
    return this.data;
  }

  public getMapDataToSave(): any {
    const layers = this.data.layers.filter(l => !l.temporary).map(l => l.toInit());
    return {...this.data, layers, x: undefined, y: undefined, scale: undefined, onDrawEnd: undefined};
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

  public getExtraLayers(customizable?: boolean): IMapLayer[] {
    const layers: IMapLayer[] = [];
    if (customizable) {
      for (const extraObject of this.extraObjects.values()) {
        layers.push(extraObject.layer);
      }
    } else {
      for (const extraObject of this.extraObjects.values()) {
        if (extraObject.layerCustomizable) layers.push(extraObject.layer);
      }
    }
    return layers;
  }

  public getNamedPoint(id: WellID): MapPoint | undefined {
    return this.data?.points.find(p => p.UWID === id);
  }

  /** Перевод координат канваса в координаты карты. */
  public eventToPoint(event: MouseEvent): Point {
    const { offsetX, offsetY } = event;
    if (!this.ctx || !this.data?.x) return {x: offsetX, y: offsetY};

    const sc = this.data.scale / pixelPerMeter;
    const canvasCenterX = this.ctx.canvas.clientWidth / 2;
    const canvasCenterY = this.ctx.canvas.clientHeight / 2;

    return {
      x: this.data.x + (offsetX - canvasCenterX) * sc,
      y: this.data.y + (offsetY - canvasCenterY) * sc
    };
  }

  public setCanvas(canvas: MapCanvas): void {
    if (canvas) {
      this.ctx = canvas.getContext('2d');
      this.scroller.setCanvas(canvas);
    } else {
      this.ctx = null;
    }
  }

  public setData(data: MapData): void {
    for (const state of this.extraObjects.values()) {
      state.provider.model = null;
      state.objectBounds = null;
      state.layer.bounds = null;
    }
    this.activeLayer = null;
    this.data = data;
  }

  public setActiveLayer(layer: MapLayer): void {
    if (this.activeLayer === layer) return;
    this.activeLayer = layer;
    this.data.layers.forEach(l => { l.active = false; });
    if (layer) layer.active = true;
    this.eventBus.publish('active-layer', layer);
  }

  public setActiveElement(element: MapElement | null): void {
    if (this.activeElement === element) return;
    this.activeElement = element;
    this.eventBus.publish('active-element', element);
  }

  /* --- Specific Actions --- */

  public clearSelect(): void {
    this.modes.get('element-select').onModeLeave();
    if (this.activeElement) {
      unselectElement(this.activeElement);
      this.setActiveElement(null);
    }
  }

  public updateActiveElement(checkBounds?: boolean): void {
    const element = this.activeElement;
    if (!element) return;

    if (checkBounds !== false) {
      const layer = this.getActiveElementLayer();
      element.bounds = getMapElementBounds(element);
      layer.bounds = getTotalBounds(layer.elements);
    }
    this.eventBus.publish('element-change', element);
  }

  public deleteActiveElement(): void {
    if (!this.activeElement) return;
    for (const layer of this.data.layers) {
      const index = layer.elements.indexOf(this.activeElement);
      if (index !== -1) {
        layer.elements.splice(index, 1);
        layer.bounds = getTotalBounds(layer.elements);
        layer.modified = true; break;
      }
    }
    this.setActiveElement(null);
  }

  /* --- Modes --- */

  public registerMode(provider: MapModeProvider): void {
    this.modes.set(provider.id, provider);
    if (provider.id === 'default') this.mode = provider;
  }

  public getMode(): MapModeID {
    return this.mode.id;
  }

  public getModeProvider(id?: MapModeID): MapModeProvider {
    return id ? this.modes.get(id) : this.mode;
  }

  public setMode(id: MapModeID): void {
    const oldMode = this.mode;
    const newMode = this.modes.get(id) ?? this.modes.get('default');
    if (oldMode === newMode) return;

    if (oldMode.onModeLeave) oldMode.onModeLeave();
    this.mode = newMode;
    if (newMode.onModeEnter) newMode.onModeEnter();

    if (this.ctx) this.ctx.canvas.style.cursor = newMode.cursor;
    this.eventBus.publish('mode', id);
  }

  /* --- Extra Objects --- */

  public registerExtraObject(id: MapExtraObjectID, config: MapExtraObjectConfig): void {
    const provider = config.provider;
    const layer = MapLayer.fromConfig(id, config.layer);
    const layerCustomizable = config.layer.customizable ?? true;
    this.extraObjects.set(id, {id, layer, layerCustomizable, provider, objectBounds: null});
  }

  public hasExtraObject(id: MapExtraObjectID): boolean {
    return this.extraObjects.has(id);
  }

  public getExtraObject<T = any>(id: MapExtraObjectID): T | null {
    return this.extraObjects.get(id)?.provider.model ?? null;
  }

  public setExtraObject(id: MapExtraObjectID, payload: any, updateView?: boolean): void {
    const state = this.extraObjects.get(id);
    if (!state) return;
    const provider = state.provider;
    const oldModel = provider.model;

    if (payload !== null && payload !== undefined) {
      provider.setModel(payload);
    } else {
      provider.model = null;
    }
    if (provider.model === null) {
      state.objectBounds = null;
      state.layer.bounds = null;
    } else if (provider.model !== oldModel) {
      state.objectBounds = provider.computeBounds();
      state.layer.bounds = state.objectBounds;
    }
    if (updateView) {
      const viewport = this.getExtraObjectViewport(id);
      if (viewport) this.render(viewport);
    }
  }

  public centerToObject(oldModels: Map<MapExtraObjectID, any>, ...ids: MapExtraObjectID[]): boolean {
    for (const oid of ids) {
      const state = this.extraObjects.get(oid);
      if (!state || !state.layer.visible) continue;
      const provider = state.provider;
      if (!provider || provider.model === null) continue;

      const oldModel = oldModels.get(oid) ?? null;
      const needChange = provider.needChangeViewport
        ? provider.needChangeViewport(oldModel, provider.model)
        : oldModel !== provider.model;

      const viewport = needChange && this.getExtraObjectViewport(oid);
      if (viewport) { this.render(viewport); return true; }
    }
    return false;
  }

  private getExtraObjectViewport(id: MapExtraObjectID): MapViewport | undefined {
    if (!this.data || !this.ctx) return undefined;
    const state = this.extraObjects.get(id);
    if (!state || !state.provider.computeViewport || !state.provider.model) return undefined;
    return state.provider.computeViewport(this.ctx.canvas, state.objectBounds);
  }

  /* --- Event Handlers --- */

  public handleWheel(e: WheelEvent): void {
    if (!this.mode.blocked) this.scroller.wheel(e);
    if (this.mode.onWheel) this.mode.onWheel(e, this);
  }

  public handleMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    if (!this.mode.blocked) this.scroller.mouseDown(e);
    if (this.mode.onClick) this.scroller.lastDownEvent = e;
    if (this.mode.onMouseDown) this.mode.onMouseDown(e, this);
  }

  public handleMouseUp(e: MouseEvent): void {
    this.scroller.mouseUp();
    if (this.mode.onMouseUp) this.mode.onMouseUp(e, this);
    const downEvent = this.scroller.lastDownEvent;
    if (downEvent && e.x === downEvent.x && e.y === downEvent.y) this.mode.onClick(e, this);
  }

  public handleMouseMove(e: MouseEvent): void {
    if (!this.mode.blocked) this.scroller.mouseMove(e);
    if (this.mode.onMouseMove) this.mode.onMouseMove(e, this);
  }

  public handleMouseLeave(e: MouseEvent): void {
    this.scroller.mouseUp();
    if (this.mode.onMouseLeave) this.mode.onMouseLeave(e, this);
  }

  /* --- Drawing --- */

  public resize(): void {
    this.render();
  }

  public render(viewport?: MapViewport): void {
    if (!this.ctx || !this.data) return;
    if (!viewport) viewport = {cx: this.data.x, cy: this.data.y, scale: this.data.scale};
    if (this.detach) this.detach();
    this.detach = showMap(this.ctx, this.data, viewport, this.extraObjects);
  }
}
