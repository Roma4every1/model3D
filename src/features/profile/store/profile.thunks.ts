import { useProfileStore } from './profile.store';
import { setProfileLoading } from './profile.actions';


/** Обновляет данные профиля. */
export function loadProfileData(id: FormID, objects: GMJobObjectParameters): Promise<void> {
  const loader = useProfileStore.getState()[id].loader;
  loader.setLoading = (p: number, s?: string) => setProfileLoading(id, p, s);
  return loader.loadProfileData(objects);
}

/** Обновляет данные достуных пластов профиля. */
export function loadProfileStrata(id: FormID, objects: GMJobObjectParameters): Promise<void> {
  const loader = useProfileStore.getState()[id].loader;
  return loader.loadStrata(objects);
}
