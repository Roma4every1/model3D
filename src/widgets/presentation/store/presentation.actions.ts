import { PresentationAction, PresentationActionType } from './presentation.reducer';


/** Установить состояние презентации. */
export function setPresentationState(state: PresentationState): PresentationAction {
  return {type: PresentationActionType.SET, payload: state};
}

/** Установить список дочерних форм. */
export function setPresentationChildren(id: FormID, children: FormDataWM[]): PresentationAction {
  return {type: PresentationActionType.SET_CHILDREN, payload: {id, children}};
}

/** Установить активную форму для презентации. */
export function setActiveForm(id: FormID, activeChildID: FormID): PresentationAction {
  return {type: PresentationActionType.SET_ACTIVE_FORM, payload: {id, activeChildID}};
}
