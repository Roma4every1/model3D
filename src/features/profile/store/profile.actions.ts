import { InitializationError } from 'shared/lib';
import { profileAPI } from '../lib/profile.api';
import { useProfileStore } from './profile.store';
import { settingsToProfileState } from '../lib/adapter';


/** Добавляет в хранилище состояний профиля новую форму профиля. */
export function createProfileState(payload: FormStatePayload): void {
  if (!profileAPI.check()) throw new InitializationError('profile.api-error');
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
export function setProfileLoading(id: FormID, percentage: number, status?: string): void {
  const state = useProfileStore.getState()[id];
  const newLoading = {percentage, status: status ?? state.loading.status};
  useProfileStore.setState({[id]: {...state, loading: newLoading}});
}

/** Обновляет данные профиля. */
export function setProfileStrata(id: FormID, strata: ProfileStratum[]): void {
  const state = useProfileStore.getState()[id];
  const parameters: ProfileParameters = {...state.parameters, strata, selectedStrata: []};
  useProfileStore.setState({[id]: {...state, parameters}});
}
