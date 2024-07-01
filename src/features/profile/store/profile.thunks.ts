import { useProfileStore } from './profile.store';
import { setProfileLoading } from './profile.actions';


/** Обновляет данные профиля. */
export async function setProfileData(id: FormID, objects: GMMOJobObjectParameters): Promise<void> {
  const loader = useProfileStore.getState()[id].loader;
  loader.setLoading = (l: Partial<ProfileLoading>) => setProfileLoading(id, l);
  const flag = ++loader.flag;
  await loader.loadProfileData(objects);
  if (flag !== loader.flag) return;
}

/** Обновляет данные достуных пластов профиля. */
export async function setProfilePlastsData(id: FormID, objects: GMMOJobObjectParameters): Promise<void> {
  const loader = useProfileStore.getState()[id].loader;
  const flag = ++loader.flag;
  await loader.loadPlData(objects);
  if (flag !== loader.flag) return;
}
