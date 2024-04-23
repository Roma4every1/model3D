import { MapLoader } from '../lib/loader';
import { MapStage } from '../lib/map-stage';
import { MapLayer } from '../lib/map-layer';
import { useMapStore, useMultiMapStore } from './map.store';
import { mapPluginDict } from '../lib/plugins';
import { getFullTraceViewport, getTraceMapElement, traceLayerProto } from '../lib/traces-map-utils';


/** Добавляет в хранилище новую мультикарту. */
export function addMultiMap(id: ClientID, templateFormID: FormID, configs: MapItemConfig[]): void {
  const mapStates = useMapStore.getState();
  const oldState = useMultiMapStore.getState()[id];

  const sync = oldState?.sync ?? true;
  templateFormID = oldState?.templateFormID ?? templateFormID;

  if (oldState) for (const { formID } of oldState.configs) {
    delete mapStates[formID];
  }
  for (const config of configs) {
    const mapState = getMapState(templateFormID, false);
    config.stage = mapState.stage;
    config.stage.scroller.sync = sync;
    mapStates[config.formID] = mapState;
  }
  useMapStore.setState({...mapStates}, true);
  useMultiMapStore.setState({[id]: {sync, templateFormID, configs, children: configs.map(c => c.formID)}});
}

/** Устанавливает значение параметра синхронизации. */
export function setMultiMapSync(formID: FormID, id: ClientID, sync: boolean): void {
  const mapStates = useMapStore.getState();
  const multiMapState = useMultiMapStore.getState()[id];

  for (const config of multiMapState.configs) {
    config.stage.scroller.sync = sync;
  }
  if (sync) {
    const stage = mapStates[formID].stage;
    const { x, y, scale } = stage.getMapData();
    stage.getCanvas().events.emit('sync', {centerX: x, centerY: y, scale});
  }
  useMultiMapStore.setState({[id]: {...multiMapState, sync}});
}

/** Добавляет в хранилище состояний карт новую карту. */
export function createMapState(payload: FormStatePayload): void {
  const pluginSettings = payload.settings;
  const id = payload.state.id;
  useMapStore.setState({[id]: getMapState(id, true, pluginSettings)});
}

export function setMapLoading(id: FormID, l: Partial<MapLoading>): void {
  const mapState = useMapStore.getState()[id];
  const newLoading = {...mapState.loading, ...l};
  useMapStore.setState({[id]: {...mapState, loading: newLoading}});
}

export function setMapCanvas(id: FormID, canvas: HTMLCanvasElement): void {
  const mapState = useMapStore.getState()[id];
  const { stage, observer, canvas: oldCanvas } = mapState;

  if (oldCanvas) observer.unobserve(oldCanvas);
  if (canvas) observer.observe(canvas);

  stage.setCanvas(canvas as MapCanvas);
  useMapStore.setState({[id]: {...mapState, canvas: canvas as MapCanvas}});
}

/** Установить какое-либо поле хранилища карты. */
export function setMapField(id: FormID, field: keyof MapState, value: any): void {
  const mapState = useMapStore.getState()[id];
  useMapStore.setState({[id]: {...mapState, [field]: value}});
}

/** Добавить в состояние карты трассу и отрисовать. */
export function applyTraceToMap(id: FormID, model: TraceModel, updateViewport: boolean): void {
  const mapState = useMapStore.getState()[id];
  const mapData = mapState?.stage.getMapData();
  if (!mapData) return;

  let traceElement: MapPolyline;
  let traceLayer = mapData.layers.find(layer => layer.id === '{TRACES-LAYER}');

  if (!traceLayer) {
    traceLayer = new MapLayer(traceLayerProto, [], true);
    mapData.layers = [...mapData.layers, traceLayer];
  }

  if (!model || !model.nodes.length) {
    traceLayer.elements = [];
  } else {
    traceElement = getTraceMapElement(model);
    traceLayer.elements = [traceElement];
    traceLayer.bounds = traceElement.bounds;
  }

  if (mapState.canvas) {
    const viewport = traceElement && updateViewport
      ? getFullTraceViewport(traceElement, mapState.canvas)
      : undefined;
    setTimeout(() => mapState.stage.render(viewport), 10);
  }
  useMapStore.setState({[id]: {...mapState}});
}

/* --- --- */

function getMapState(id: FormID, editable: boolean, settings?: Record<string, any>): MapState {
  const plugins: IMapPlugin[] = [];
  if (!settings) settings = {};

  for (const pluginName in settings) {
    const Plugin = mapPluginDict[pluginName];
    if (Plugin) plugins.push(new Plugin(settings[pluginName]));
  }

  const stage = new MapStage(plugins);
  const observer = new ResizeObserver(() => { stage.resize(); });

  return {
    canvas: null, stage, loader: new MapLoader(id), observer,
    owner: null, mapID: null, loading: {percentage: 100, status: null},
    modified: false, editable,
    propertyWindowOpen: false, attrTableWindowOpen: false,
    pluginsSettings: settings,
  };
}
