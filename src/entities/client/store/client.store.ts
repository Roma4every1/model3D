import { create } from 'zustand';


export const useClientStore = create((): ClientStates => ({}));

export const useClientState = (id: ClientID) => useClientStore(state => state[id]);
