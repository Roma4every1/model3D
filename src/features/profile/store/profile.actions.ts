import { useProfileStore } from './profile.store';
import { settingsToProfileState } from '../rendering/adapter';


/** Добавляет в хранилище состояний профиля новую форму профиля. */
export function createProfileState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useProfileStore.setState({[id]: settingsToProfileState()});
}

/** Установить элемент холста. */
export function setProfileCanvas(id: FormID, canvas: HTMLCanvasElement): void {
  const state = useProfileStore.getState()[id];
  const { stage, observer, canvas: oldCanvas } = state;

  if (oldCanvas) observer.unobserve(oldCanvas);
  if (canvas) observer.observe(canvas);

  stage.setCanvas(canvas);
  useProfileStore.setState({[id]: {...state, canvas}});
}

/** Обновляет данные загрузчика. */
export function setProfileLoading(id: FormID, loading: Partial<CaratLoading>): void {
  const state = useProfileStore.getState()[id];
  const newLoading = {...state.loading, ...loading};
  useProfileStore.setState({[id]: {...state, loading: newLoading}});
}

/** Обновляет данные профиля. */
export async function setProfileData(id: FormID, trace: TraceModel, channels: ChannelDict): Promise<void> {
  const { loader, stage } = useProfileStore.getState()[id];

  loader.setLoading = (loading: Partial<ProfileLoading>) => {
    if (loading.status) loading.status = 'profile.loading.' + loading.status;
    setProfileLoading(id, loading);
  };

  const flag = ++loader.flag;
  await loader.loadProfileData(id, trace, channels);
  if (flag !== loader.flag) return;

  stage.setData(loader.cache);
  loader.setLoading({percentage: 100});
}
