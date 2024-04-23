import { create } from 'zustand';


/** Хранилище форм профиля. */
export const useProfileStore = create<ProfileStates>(() => ({}));

/** Состояние формы профиля. */
export const useProfileState = (id: FormID) => useProfileStore(state => state[id]);
