import { settingsToChartState } from '../lib/initialization';

/* --- Action Types --- */

export enum ChartsActionType {
  CREATE = 'charts/set',
  SET_FIELD = 'charts/field',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: ChartsActionType.CREATE,
  payload: FormStatePayload,
}
interface ActionSetField {
  type: ChartsActionType.SET_FIELD,
  payload: {id: FormID, field: keyof ChartState, value: any},
}

export type ChartsAction = ActionSet | ActionSetField;

/* --- Init State & Reducer --- */

const init: ChartStates = {};

export function chartsReducer(state: ChartStates = init, action: ChartsAction): ChartStates {
  switch (action.type) {

    case ChartsActionType.CREATE: {
      const { state: formState, settings } = action.payload;
      return {...state, [formState.id]: settingsToChartState(settings)};
    }

    case ChartsActionType.SET_FIELD: {
      const { id, field, value } = action.payload;
      const newChartState = {...state[id], [field]: value};
      return {...state, [id]: newChartState};
    }

    default: return state;
  }
}
