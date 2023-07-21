import { IJsonModel } from 'flexlayout-react';
import { PresentationAction, PresentationActionType } from './presentation.reducer';


/** Установить состояние презентации. */
export function setPresentationState(state: PresentationState): PresentationAction {
  return {type: PresentationActionType.SET, payload: state};
}

/** Установить список дочерних форм. */
export function setPresentationChildren(id: FormID, children: FormDataWMR[]): PresentationAction {
  return {type: PresentationActionType.SET_CHILDREN, payload: {id, children}};
}

/** Установить разметку презентации. */
export function setPresentationLayout(id: FormID, layout: IJsonModel): PresentationAction {
  return {type: PresentationActionType.SET_LAYOUT, payload: {id, layout}};
}

/** Установить активную форму для презентации. */
export function setActiveForm(id: FormID, activeChildID: FormID): PresentationAction {
  return {type: PresentationActionType.SET_ACTIVE_FORM, payload: {id, activeChildID}};
}

/** Очистить состояния презентаций. */
export function clearPresentations(): PresentationAction {
  return {type: PresentationActionType.CLEAR};
}
