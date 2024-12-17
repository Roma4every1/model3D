import type { ObjectsState } from './objects.store';
import { PlaceManager } from '../lib/place';
import { StratumManager } from '../lib/stratum';
import { WellManager } from '../lib/well';
import { TraceManager } from '../lib/trace';
import { SiteManager } from '../lib/site';
import { useObjectsStore } from './objects.store';


export function initializeObjects(parameters: Parameter[], channels: ChannelDict): ObjectsState {
  const placeManager = new PlaceManager(parameters, channels);
  const stratumManager = new StratumManager(parameters, channels);
  const wellManager = new WellManager(parameters, channels);
  const traceManager = new TraceManager(channels, wellManager.channelID);
  const siteManager = new SiteManager(channels);

  const newState: ObjectsState = {
    place: placeManager, stratum: stratumManager,
    well: wellManager, trace: traceManager,
    site: siteManager,
  };
  useObjectsStore.setState(newState, true);
  return newState;
}

export function initializeObjectModels(parameters: Parameter[], channels: ChannelDict): void {
  const { place, stratum, well, trace, site } = useObjectsStore.getState();
  if (place.activated()) place.initializeModel(parameters);
  if (stratum.activated()) stratum.initializeModel(parameters);
  if (well.activated()) well.initializeModel(parameters);
  if (trace.activated()) trace.initializeModel(parameters, channels);
  if (site.activated()) site.initializeModel(parameters, channels);
  useObjectsStore.setState({place, stratum, well, trace, site}, true);
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
