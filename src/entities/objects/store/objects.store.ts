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
export function useCurrentPlace(): PlaceModel | null {
  return useObjectsStore(state => state.place.model);
}
/** Модель активного пласта. */
export function useCurrentStratum(): StratumModel | null {
  return useObjectsStore(state => state.stratum.model);
}
/** Модель активной скважины. */
export function useCurrentWell(): WellModel | null {
  return useObjectsStore(state => state.well.model);
}
/** Модель активной трассы. */
export function useCurrentTrace(): TraceModel | null {
  return useObjectsStore(state => state.trace.model);
}
/** Модель активного участка. */
export function useCurrentSite(): SiteModel | null {
  return useObjectsStore(state => state.site.state.model);
}

/** Менеджер трасс. */
export function useTraceManager(): TraceManager {
  return useObjectsStore(state => state.trace);
}
/** Находится ли трасса в состоянии редактирования. */
export function useTraceEditing(): boolean {
  return useObjectsStore(state => state.trace.editing === true);
}

export function useSiteState(): SiteState {
  return useObjectsStore(state => state.site.state);
}
export function useSiteEditMode(): SiteEditMode | null {
  return useObjectsStore(state => state.site.state.editMode);
}
