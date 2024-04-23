import { create } from 'zustand';


/** Активные объекты. */
export const useObjectsStore = create<ObjectsState>(() => ({
  place: {
    channelName: null,
    parameterID: null,
    model: null,
  },
  stratum: {
    channelName: null,
    parameterID: null,
    model: null,
  },
  well: {
    channelName: null,
    parameterID: null,
    model: null,
  },
  trace: {
    channelName: null,
    nodeChannelName: null,
    parameterID: null,
    model: null,
    oldModel: null,
    editing: false,
    creating: false,
  },
}));

/** Состояние активного месторождения. */
export const useCurrentPlaceModel = () => useObjectsStore(state => state.place.model);

/** Состояние активного пласта. */
export const useCurrentStratum = () => useObjectsStore(state => state.stratum);

/** Состояние активной скважины. */
export const useCurrentWell = () => useObjectsStore(state => state.well);

/** Состояние активной трассы. */
export const useCurrentTrace = () => useObjectsStore(state => state.trace);

/** Находится ли трасса в состоянии редактирования. */
export const useTraceEditing = () => useObjectsStore(state => state.trace.editing === true);
