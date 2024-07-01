import { create } from 'zustand';


export const useClientStore = create((): ClientStates => ({}));

export function useClientState(id: ClientID): SessionClient {
  return useClientStore(states => states[id]);
}
export function useRootClient(): RootClient {
  return useClientStore(states => states.root) as RootClient;
}
export function useActivePresentation(): PresentationState {
  return useClientStore(states => states[states.root.activeChildID]) as PresentationState;
}
