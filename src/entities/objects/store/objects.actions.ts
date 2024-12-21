import { useObjectsStore } from './objects.store';


export function initializeObjectModels(parameters: Parameter[], channels: ChannelDict): void {
  const { place, stratum, well, trace, selection, site } = useObjectsStore.getState();
  if (place.activated()) place.initializeModel(parameters);
  if (stratum.activated()) stratum.initializeModel(parameters);
  if (well.activated()) well.initializeModel(parameters);
  if (trace.activated()) trace.initializeModel(parameters, channels);
  if (selection.activated()) selection.initializeModel(parameters, channels);
  if (site.activated()) site.initializeModel(parameters, channels);
  useObjectsStore.setState({place, stratum, well, trace, selection, site}, true);
}

/** Установить состояние трассы. */
export function setCurrentTrace(model: TraceModel, creating?: boolean, editing?: boolean): void {
  const traceManager = useObjectsStore.getState().trace;
  if (model === undefined) model = traceManager.model;
  if (creating === undefined) creating = traceManager.creating;
  if (editing === undefined) editing = traceManager.editing;

  if (editing && !traceManager.editing) {
    traceManager.oldModel = creating ? null : structuredClone(model);
  }
  traceManager.editing = editing;
  traceManager.creating = creating;
  traceManager.model = model;
  useObjectsStore.setState({trace: traceManager.clone()});
}

export function startSiteEditing(): void {
  const manager = useObjectsStore.getState().site;
  const model = manager.state.model;
  const initModel = structuredClone(model);
  manager.state = {model, initModel, editMode: 'site-move-point'};
  useObjectsStore.setState({site: manager});
}

export function setSiteState(state: Partial<SiteState>): void {
  const manager = useObjectsStore.getState().site;
  manager.state = {...manager.state, ...state};
  useObjectsStore.setState({site: manager});
}
