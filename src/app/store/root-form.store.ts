import { create } from 'zustand';


/** Состояние корневой формы. */
export const useRootStore = create<RootFormState>(() => ({
  id: '',
  settings: {presentationTree: []},
  children: [],
  activeChildID: '',
  layout: null,
}));

/** ID активной презентации. */
export const useActivePresentationID = () => useRootStore(state => state.activeChildID);
