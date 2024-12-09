import { MapStage } from '../lib/map-stage';
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

export function setMapField(id: FormID, field: keyof MapState, value: any): void {
  const state = useMapStore.getState()[id];
  useMapStore.setState({[id]: {...state, [field]: value}});
}

export function applyWellToMap(id: FormID, well: WellID, updateView?: boolean): void {
  const mapState = useMapStore.getState()[id];
  const stage = mapState.stage as MapStage;

  if (!stage.hasExtraObject('well')) return;
  const mapPoint = well !== null ? stage.getNamedPoint(well) : undefined;
  stage.setExtraObjectModel('well', mapPoint);

  if (mapState.canvas) {
    const viewport = updateView ? stage.getExtraObjectViewport('well') : undefined;
    setTimeout(() => stage.render(viewport), 1);
  }
}

export function applyTraceToMap(id: FormID, model: TraceModel, updateView?: boolean): void {
  const mapState = useMapStore.getState()[id];
  const stage = mapState.stage as MapStage;

  if (!stage.hasExtraObject('trace')) return;
  stage.setExtraObjectModel('trace', model ?? null);

  if (mapState.canvas) {
    const viewport = updateView ? stage.getExtraObjectViewport('trace') : undefined;
    setTimeout(() => stage.render(viewport), 1);
  }
  useMapStore.setState({[id]: {...mapState}});
}
