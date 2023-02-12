import { IJsonModel } from 'flexlayout-react';
import { PresentationsAction, PresentationsActions } from './presentations.reducer';


/** Установить состояние презентации. */
export const setPresentationState = (state: PresentationState): PresentationsAction => {
  return {type: PresentationsActions.SET, payload: state};
};

/** Установить список дочерних форм. */
export const setPresentationChildren = (id: FormID, children: FormDataWMR[]): PresentationsAction => {
  return {type: PresentationsActions.SET_CHILDREN, payload: {id, children}};
};

/** Установить разметку презентации. */
export const setPresentationLayout = (id: FormID, layout: IJsonModel): PresentationsAction => {
  return {type: PresentationsActions.SET_LAYOUT, payload: {id, layout}};
};

/** Установить активную форму для презентации. */
export const setActiveForm = (id: FormID, activeChildID: FormID): PresentationsAction => {
  return {type: PresentationsActions.SET_ACTIVE_FORM, payload: {id, activeChildID}};
};
