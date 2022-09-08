import { PresentationsAction, PresentationsActions } from "../reducers/presentations";


export const fetchPresentationsStart = (): PresentationsAction => {
  return {type: PresentationsActions.FETCH_START};
}

export const fetchPresentationsEnd = (data: PresentationItem | string): PresentationsAction => {
  return {type: PresentationsActions.FETCH_END, data};
}

export const changePresentations = (sessionID: SessionID, formID: FormID) => {
  return {type: PresentationsActions.CHANGE, sessionID, formID};
}

export const selectPresentation = (item: PresentationItem): PresentationsAction => {
  return {type: PresentationsActions.SET_SELECTED, item};
}
