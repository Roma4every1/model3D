import { MapStateFactory } from '../lib/initialization';
import { useMapStore } from './map.store';


export function createMapState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useMapStore.setState({[id]: MapStateFactory.create(id, payload)});
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

export function setMapObjects(id: FormID, payload: Record<string, any>): void {
  const stage = useMapStore.getState()[id].stage;
  const oldModels: Map<string, any> = new Map();

  for (const oid in payload) {
    if (!stage.hasExtraObject(oid)) continue;
    oldModels.set(oid, stage.getExtraObject(oid));
    stage.setExtraObject(oid, payload[oid]);
  }
  if (!stage.getMapData()) return;
  const changed = stage.centerToObject(oldModels, 'incl', 'well', 'trace', 'site', 'selection');
  if (!changed) stage.render();
}
