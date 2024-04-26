import { create } from 'zustand';


/** Активные объекты. */
export const useObjectsStore = create((): ObjectsState => ({
  place: null,
  stratum: null,
  well: null,
  trace: null,
}));

/** Модель активного месторождения. */
export const useCurrentPlace = () => useObjectsStore(state => state.place.model);
/** Модель активного пласта. */
export const useCurrentStratum = () => useObjectsStore(state => state.stratum.model);
/** Модель активной скважины. */
export const useCurrentWell = () => useObjectsStore(state => state.well.model);
/** Модель активной трассы. */
export const useCurrentTrace = () => useObjectsStore(state => state.trace.model);

/** Менеджер трасс. */
export const useTraceManager = () => useObjectsStore(state => state.trace);
/** Находится ли трасса в состоянии редактирования. */
export const useTraceEditing = () => useObjectsStore(state => state.trace.editing === true);
