import { updateParamDeep } from 'entities/parameter';
import { MapLoader } from '../loader/loader';
import { MapStage } from '../lib/map-stage';
import { MapLayer } from '../lib/map-layer';
import { useMapStore } from './map.store';
import { mapPluginDict } from '../lib/plugins';
import { getFullTraceViewport, getTraceMapElement, traceLayerProto } from '../lib/traces-map-utils';


/** Добавляет в хранилище состояний карт новую карту. */
export function createMapState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useMapStore.setState({[id]: getMapState(id, true, payload)});
}

export function setMapStatus(id: FormID, status: MapStatus): void {
  const state = useMapStore.getState()[id];
  useMapStore.setState({[id]: {...state, status}});
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
  const state = useMapStore.getState()[id];
  useMapStore.setState({[id]: {...state, [field]: value}});
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

export function getMapState(id: FormID, editable: boolean, payload?: FormStatePayload): MapState {
  const plugins: IMapPlugin[] = [];

  if (payload) {
    const settings: Record<string, any> = payload.state.settings ?? {};
    const parentParameters = payload.parameters[payload.state.parent];
    const channels = payload.state.channels;

    for (const pluginName in settings) {
      const Plugin = mapPluginDict[pluginName];
      if (Plugin) plugins.push(new Plugin(settings[pluginName], parentParameters, channels));
    }
  }

  const stage = new MapStage(plugins);
  const observer = new ResizeObserver(() => { stage.resize(); });

  const inclPlugin = stage.getPlugin('incl');
  if (inclPlugin) inclPlugin.onParameterUpdate = (v) => updateParamDeep(inclPlugin.parameterID, v);

  return {
    stage, loader: new MapLoader(id), observer, objects: {well: null, trace: null},
    canvas: null, status: 'empty', owner: null, mapID: null, modified: false,
    editable, propertyWindowOpen: false, attrTableWindowOpen: false,
  };
}
