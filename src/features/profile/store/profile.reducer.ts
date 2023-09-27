/* --- Action Types --- */

export enum ProfileActionType {
  CREATE = 'profile/create',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: ProfileActionType.CREATE;
  payload: FormStatePayload;
}

export type ProfileAction = ActionCreate;

/* --- Init State & Reducer --- */

const init: ProfileStates = {};

export function profileReducer(state: ProfileStates = init, action: ProfileAction): ProfileStates {
  switch (action.type) {

    case ProfileActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: {data: null}};
    }

    default: return state;
  }
}
