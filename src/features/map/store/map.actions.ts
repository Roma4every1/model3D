import { MapsAction, MapsActions } from './map.reducer';


/** Добавляет в хранилище новую мультикарту. */
export function addMultiMap(id: ClientID, templateFormID: FormID, configs: MapItemConfig[]): MapsAction {
  return {type: MapsActions.ADD_MULTI_MAP, payload: {id, templateFormID, configs}};
}

/** Устанавливает значение параметра синхронизации. */
export function setMultiMapSync(id: ClientID, sync: boolean): MapsAction {
  return {type: MapsActions.SET_SYNC, payload: {id, sync}};
}

/** Добавляет в хранилище состояний карт новую карту. */
export function createMapState(payload: FormStatePayload): MapsAction {
  return {type: MapsActions.ADD, payload};
}

/** Начало загрузки карты. */
export function startMapLoad(formID: FormID): MapsAction {
  return {type: MapsActions.START_LOAD, formID};
}

/** Устанавливает значение для поля `mapData` при успешной загрузке. */
export function loadMapSuccess(formID: FormID, mapData: any): MapsAction {
  return {type: MapsActions.LOAD_SUCCESS, formID, mapData};
}

/** Ошибка при загрузке карты. */
export function loadMapError(formID: FormID): MapsAction {
  return {type: MapsActions.SET_FIELD, formID: formID, field: 'isLoadSuccessfully', payload: false};
}

/** Установить какое-либо поле хранилища карты. */
export function setMapField(formID: FormID, field: keyof MapState, payload: any): MapsAction {
  return {type: MapsActions.SET_FIELD, formID, field, payload};
}

/** Установить выделенный элемент. */
export function setSelectedElement(formID: FormID, element: MapElement): MapsAction {
  return {type: MapsActions.SET_FIELD, formID, field: 'element', payload: element};
}

/** Снять выделение с карты. */
export function clearMapSelect(formID: FormID, elementOnly = true): MapsAction {
  return {type: MapsActions.CLEAR_SELECT, formID, elementOnly};
}

/** Установить активный слой карты. */
export function setActiveLayer(formID: FormID, layer: any): MapsAction {
  return {type: MapsActions.SET_FIELD, formID, field: 'activeLayer', payload: layer};
}

/** Установить режим. */
export function setEditMode(formID: FormID, mode: number): MapsAction {
  return {type: MapsActions.SET_MODE, formID, payload: mode};
}

/** Начать редактирование элемента. */
export function startMapEditing(formID: FormID): MapsAction {
  return {type: MapsActions.START_EDITING, formID};
}

/** Применить изменения к элементу. */
export function acceptMapEditing(formID: FormID): MapsAction {
  return {type: MapsActions.ACCEPT_EDITING, formID};
}

/** Отменить редактирование элемента карты. */
export function cancelMapEditing(formID: FormID): MapsAction {
  return {type: MapsActions.CANCEL_EDITING, formID};
}

/** Перейти в режим создания элемента. */
export function startCreatingElement(formID: FormID): MapsAction {
  return {type: MapsActions.START_CREATING, formID};
}

/** Добавить элемент на карту. */
export function createMapElement(formID: FormID, element: MapElement): MapsAction {
  return {type: MapsActions.CREATE_ELEMENT, formID, payload: element};
}

/** Подтвердить создание элемента. */
export function acceptCreatingElement(formID: FormID): MapsAction {
  return {type: MapsActions.ACCEPT_CREATING, formID};
}

/** Выйти из режима создания элемента. */
export function cancelCreatingElement(formID: FormID): MapsAction {
  return {type: MapsActions.CANCEL_CREATING, formID};
}

/** Добавить в состояние карты трассу и отрисовать. */
export function applyTraceToMap(formID: FormID, model: TraceModel, updateViewport: boolean): MapsAction {
  return {type: MapsActions.SET_TRACE, formID, model, updateViewport};
}
