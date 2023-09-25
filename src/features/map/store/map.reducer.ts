import { MapStage } from '../lib/map-stage.ts';
import { MapLayer } from '../lib/map-layer.ts';
import { traceLayerProto, getTraceMapElement, getFullTraceViewport } from '../lib/traces-map-utils';

/* --- Action Types --- */

export enum MapActionType {
  ADD_MULTI_MAP = 'map/multi',
  SET_SYNC = 'map/sync',
  CREATE = 'map/create',
  SET_LOADING = 'map/loading',
  SET_CANVAS = 'map/canvas',
  SET_FIELD = 'map/field',
  SET_TRACE = 'map/trace',
}

/* --- Action Interfaces --- */

interface ActionAddMulti {
  type: MapActionType.ADD_MULTI_MAP;
  payload: {id: ClientID, configs: MapItemConfig[], templateFormID: FormID};
}
interface ActionSetSync {
  type: MapActionType.SET_SYNC;
  payload: {id: ClientID, sync: boolean};
}

interface ActionCreate {
  type: MapActionType.CREATE;
  payload: FormStatePayload;
}
interface ActionSetLoading {
  type: MapActionType.SET_LOADING;
  payload: {id: FormID, loading: Partial<MapLoading>};
}
interface ActionSetCanvas {
  type: MapActionType.SET_CANVAS;
  payload: {id: FormID, canvas: MapCanvas};
}
interface ActionSetField {
  type: MapActionType.SET_FIELD;
  payload: {id: FormID, field: keyof MapState, value: any};
}
interface ActionSetTrace {
  type: MapActionType.SET_TRACE;
  payload: {id: FormID, model: TraceModel, updateViewport: boolean};
}

export type MapAction = ActionAddMulti | ActionSetSync | ActionCreate |
  ActionSetLoading | ActionSetField | ActionSetTrace | ActionSetCanvas;

/* --- Init State & Reducer --- */

function createMapState(): MapState {
  const stage = new MapStage();
  const observer = new ResizeObserver(() => { stage.resize(); });

  return {
    canvas: null, stage, observer,
    owner: null, mapID: null,
    loading: {percentage: 100, status: null},
    modified: false, propertyWindowOpen: false, attrTableWindowOpen: false,
  };
}

const init: MapsState = {multi: {}, single: {}};

export const mapsReducer = (state: MapsState = init, action: MapAction): MapsState => {
  switch (action.type) {

    /* --- multi --- */

    case MapActionType.ADD_MULTI_MAP: {
      const { id, configs } = action.payload;
      const oldState = state.multi[id];
      const sync = oldState?.sync ?? true;
      const templateFormID = oldState?.templateFormID ?? action.payload.templateFormID;
      state.multi[id] = {sync, templateFormID, configs, children: configs.map(c => c.formID)};
      return {...state};
    }

    case MapActionType.SET_SYNC: {
      const { id: parentID, sync } = action.payload;
      state.multi[parentID] = {...state.multi[parentID], sync};
      return {...state};
    }

    /* --- single --- */

    case MapActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, single: {...state.single, [id]: createMapState()}};
    }

    case MapActionType.SET_LOADING: {
      const { id, loading } = action.payload;
      const newLoading = {...state.single[id].loading, ...loading};
      return {...state, single: {...state.single, [id]: {...state.single[id], loading: newLoading}}};
    }

    case MapActionType.SET_CANVAS: {
      const { id, canvas } = action.payload;
      const { stage, observer, canvas: oldCanvas } = state.single[id];

      if (oldCanvas) observer.unobserve(oldCanvas);
      if (canvas) observer.observe(canvas);

      stage.setCanvas(canvas);
      return {...state, single: {...state.single, [id]: {...state.single[id], canvas}}};
    }

    case MapActionType.SET_FIELD: {
      const { id, field, value } = action.payload;
      state.single[id] = {...state.single[id], [field]: value};
      return {...state};
    }

    // case MapsActions.ACCEPT_EDITING: {
    //   const newMapState: MapState = {...state.single[action.formID]};
    //   newMapState.isModified = true;
    //
    //   const element = newMapState.stage.getActiveElement();
    //   if (element.type === 'polyline') {
    //     element.bounds = getBoundsByPoints(chunk(element.arcs[0].path, 2) as [number, number][]);
    //     newMapState.isModified = !(element as MapPolyline)?.isTrace;
    //   }
    //
    //   newMapState.stage.acceptEditing();
    //   newMapState.stage.render();
    //   state.single[action.formID] = newMapState;
    //   return {...state};
    // }

    // case MapsActions.CREATE_ELEMENT: {
    //   const newMapState = {...state.single[action.formID]};
    //   newMapState.element = action.payload;
    //
    //   newMapState.isElementEditing = true;
    //   newMapState.activeLayer.elements.push(action.payload);
    //   newMapState.canvas.blocked = false;
    //
    //   const isPolyline = newMapState.element.type === 'polyline';
    //   newMapState.mode = isPolyline ? MapMode.ADD_END : MapMode.MOVE_MAP;
    //   newMapState.canvas.blocked = isPolyline;
    //   newMapState.isModified = !(isPolyline && (newMapState.element as MapPolyline)?.isTrace);
    //
    //   newMapState.cursor = 'auto';
    //   newMapState.stage.render();
    //   state.single[action.formID] = newMapState;
    //   return {...state};
    // }

    case MapActionType.SET_TRACE: {
      const { id, model, updateViewport } = action.payload;
      const mapState = state.single[id];
      const mapData = mapState?.stage.getMapData();
      if (!mapData) return state;

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

      const viewport = traceElement && updateViewport
        ? getFullTraceViewport(traceElement, mapState.canvas)
        : undefined;
      mapState.stage.render(viewport);
      return {...state};
    }

    default: return state;
  }
};
