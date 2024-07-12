import { useObjectsStore } from 'entities/objects';
import { useProfileStore } from './profile.store';
import { setProfileStrata, setProfileLoading } from './profile.actions';


/** Обновление достуных пластов для построения профиля. */
export async function updateProfileStrata(id: FormID, objects: ProfileObjects): Promise<void> {
  if (!objects.stratum || !objects.trace) return setProfileStrata(id, []);
  setProfileStrata(id, undefined);

  const loader = useProfileStore.getState()[id].loader;
  const data: ProfileStratum[] | Error = await loader.loadStrata(objects).catch(e => e);

  if (data instanceof Error) {
    if (data.message === 'abort') return;
    setProfileStrata(id, null);
  } else {
    setProfileStrata(id, data);
  }
}

/** Обновляет данных профиля. */
export async function updateProfile(id: FormID): Promise<void> {
  const { loader, stage, parameters } = useProfileStore.getState()[id];
  const { selectedStrata, ratio } = parameters;
  let data: MapData | Error | undefined;

  const objectStore = useObjectsStore.getState();
  const place = objectStore.place.model;
  const stratum = objectStore.stratum.model;
  const trace = objectStore.trace.model;

  if (stratum && place && trace?.nodes?.length && selectedStrata?.length) {
    stage.setData(null);
    loader.setLoading = (p: number, s?: string) => setProfileLoading(id, p, s);
    const objects: ProfileObjects = {place, stratum, trace};
    data = await loader.loadProfile(objects, selectedStrata, ratio).catch(e => e);
  }

  if (data instanceof Error) {
    let message = data.message;
    if (message === 'abort') return;
    if (!message.startsWith('job') && message !== 'timeout') message = 'unknown';
    stage.setData(null);
    setProfileLoading(id, -1, 'profile.error-' + message);
  } else if (data) {
    stage.setData(data);
    setProfileLoading(id, 100);
  } else {
    stage.setData(null);
    setProfileLoading(id, 100);
  }
}
