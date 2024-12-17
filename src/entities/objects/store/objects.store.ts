import { create } from 'zustand';
import { PlaceManager } from '../lib/place';
import { StratumManager } from '../lib/stratum';
import { WellManager } from '../lib/well';
import { TraceManager } from '../lib/trace';
import { SiteManager } from '../lib/site';


/** Менеджеры активных объектов. */
export interface ObjectsState {
  /** Месторождение. */
  place: PlaceManager;
  /** Пласт. */
  stratum: StratumManager;
  /** Скважина. */
  well: WellManager;
  /** Трасса. */
  trace: TraceManager;
  /** Участок. */
  site: SiteManager;
}

/** Активные объекты. */
export const useObjectsStore = create((): ObjectsState => ({
  place: null,
  stratum: null,
  well: null,
  trace: null,
  site: null,
}));

/** Модель активного месторождения. */
export function useCurrentPlace(): PlaceModel {
  return useObjectsStore(state => state.place.model);
}
/** Модель активного пласта. */
export function useCurrentStratum(): StratumModel {
  return useObjectsStore(state => state.stratum.model);
}
/** Модель активной скважины. */
export function useCurrentWell(): WellModel {
  return useObjectsStore(state => state.well.model);
}
/** Модель активной трассы. */
export function useCurrentTrace(): TraceModel {
  return useObjectsStore(state => state.trace.model);
}
/** Модель активного участка. */
export function useCurrentSite(): SiteModel {
  return useObjectsStore(state => state.site.model);
}

/** Менеджер трасс. */
export function useTraceManager(): TraceManager {
  return useObjectsStore(state => state.trace);
}
/** Находится ли трасса в состоянии редактирования. */
export function useTraceEditing(): boolean {
  return useObjectsStore(state => state.trace.editing === true);
}
