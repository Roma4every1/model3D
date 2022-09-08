import { MapModes } from "../../components/forms/Map/enums";
import { MapsAction, MapsActions } from "../reducers/maps";


/** Добавляет в хранилище состояний карт новую карту. */
export const createMapState = (formID: FormID, drawer: MapsDrawer): MapsAction => {
  return {type: MapsActions.ADD, formID, drawer};
}

/** Начало загрузки карты. */
export const startMapLoad = (formID: FormID): MapsAction => {
  return {type: MapsActions.START_LOAD, formID};
}

/** Устанавливает значение для поля `mapData` при успешной загрузке. */
export const loadMapSuccess = (formID: FormID, mapData: any): MapsAction => {
  return {type: MapsActions.LOAD_SUCCESS, formID, mapData};
}

/** Ошибка при загрузке карты. */
export const loadMapError = (formID: FormID): MapsAction => {
  return {type: MapsActions.LOAD_ERROR, formID: formID};
}

export const setOnDrawEnd = (formID: FormID, setter: any): MapsAction => {
  return {type: MapsActions.SET_DRAW_END, formID, payload: setter};
}

export const setMapField = (formID: FormID, field: keyof MapState, payload: any): MapsAction => {
  return {type: MapsActions.SET_FIELD, formID, field, payload};
}

/** Установить выделенный элемент. */
export const setSelectedElement = (formID: FormID, element: MapElement): MapsAction => {
  return {type: MapsActions.SET_FIELD, formID, field: 'element', payload: element};
}

/** Снять выделение с карты. */
export const clearMapSelect = (formID: FormID, elementOnly = true): MapsAction => {
  return {type: MapsActions.CLEAR_SELECT, formID, elementOnly};
}

/** Установить активный слой карты. */
export const setActiveLayer = (formID: FormID, layer: any): MapsAction => {
  return {type: MapsActions.SET_FIELD, formID, field: 'activeLayer', payload: layer};
}

export const setEditMode = (formID: FormID, mode: MapModes): MapsAction => {
  return {type: MapsActions.SET_MODE, formID, payload: mode};
}

export const startMapEditing = (formID: FormID): MapsAction => {
  return {type: MapsActions.START_EDITING, formID};
}

export const acceptMapEditing = (formID: FormID): MapsAction => {
  return {type: MapsActions.ACCEPT_EDITING, formID};
}

/** Отменить редактирование элемента карты. */
export const cancelMapEditing = (formID: FormID): MapsAction => {
  return {type: MapsActions.CANCEL_EDITING, formID};
}

/** Перейти в режим создания элемента. */
export const startCreatingElement = (formID: FormID): MapsAction => {
  return {type: MapsActions.START_CREATING, formID};
}

/** Добавить элемент на карту. */
export const createMapElement = (formID: FormID, element: MapElement): MapsAction => {
  return {type: MapsActions.CREATE_ELEMENT, formID, payload: element};
}

/** Выйти из режима создания элемента. */
export const cancelCreatingElement = (formID: FormID): MapsAction => {
  return {type: MapsActions.CANCEL_CREATING, formID};
}
