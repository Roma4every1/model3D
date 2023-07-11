import { settingsToChartState } from '../lib/initialization';

/* --- Action Types --- */

export enum ChartsActionType {
  SET = 'charts/set',
  SET_FIELD = 'charts/field',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: ChartsActionType.SET,
  payload: {id: FormID, settings: ChartFormSettings},
}
interface ActionSetField {
  type: ChartsActionType.SET_FIELD,
  payload: {id: FormID, field: keyof ChartState, value: any},
}

export type ChartsAction = ActionSet | ActionSetField;

/* --- Init State & Reducer --- */

const init: ChartsState = {};

export function chartsReducer(state: ChartsState = init, action: ChartsAction): ChartsState {
  switch (action.type) {

    case ChartsActionType.SET: {
      const { id, settings } = action.payload;
      return {...state, [id]: settingsToChartState(settings)};
    }

    case ChartsActionType.SET_FIELD: {
      const { id, field, value } = action.payload;
      const newChartState = {...state[id], [field]: value};
      return {...state, [id]: newChartState};
    }

    default: return state;
  }
}
