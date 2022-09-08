import { ProgramsAction, ProgramsActions } from "../reducers/programs";


export const addFormPrograms = (formID: FormID): ProgramsAction => {
  return {type: ProgramsActions.ADD, formID};
}

export const fetchProgramsStart = (formID: FormID): ProgramsAction => {
  return {type: ProgramsActions.FETCH_START, formID};
}

export const fetchProgramsEndSuccess = (formID: FormID, data: ProgramListData): ProgramsAction => {
  return {type: ProgramsActions.FETCH_END, formID, data};
}

export const fetchProgramsEndError = (formID: FormID, data: string): ProgramsAction => {
  return {type: ProgramsActions.FETCH_END, formID, data};
}
