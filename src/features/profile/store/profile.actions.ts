import { ProfileAction, ProfileActionType } from './profile.reducer.ts';


/** Добавляет в хранилище состояний профиля новую форму профиля. */
export function createProfileState(payload: FormStatePayload): ProfileAction {
  return {type: ProfileActionType.CREATE, payload};
}

/** Установить элемент холста. */
export function setProfileCanvas(id: FormID, canvas: HTMLCanvasElement): ProfileAction {
  return {type: ProfileActionType.SET_CANVAS, payload: {id, canvas}};
}

/** Обновляет данные каналов. */
export function setProfileLoading(id: FormID, loading: Partial<CaratLoading>): ProfileAction {
  return {type: ProfileActionType.SET_LOADING, payload: {id, loading}};
}
