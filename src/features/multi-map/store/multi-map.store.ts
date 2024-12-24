import { create } from 'zustand';
import { MapStage } from 'features/map/lib/map-stage';
import { MapLoader } from 'features/map/loader/loader';


export interface MultiMapState {
  readonly templateFormID: FormID;
  layout: any;
  sync: boolean;
  children: MultiMapChild[];
}
export interface MultiMapChild {
  readonly id: MapID;
  readonly storage: MapStorageID;
  readonly formID: FormID;
  readonly stratumName: string;
  stage: MapStage;
  loader: MapLoader;
  loadFlag?: boolean;
}

/** Хранилище состояний мультикарт. */
export const useMultiMapStore = create((): Record<FormID, MultiMapState> => ({}));

export function useMultiMapState(id: ClientID): MultiMapState {
  return useMultiMapStore(state => state[id]);
}
export function useMultiMapSync(id: ClientID): boolean | undefined {
  return useMultiMapStore(state => state[id]?.sync);
}
