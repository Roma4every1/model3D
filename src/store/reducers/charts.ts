/* --- Actions Types --- */

export enum ChartsActions {
  ADD = 'charts/add',
  SET_TOOLTIP_VISIBLE = 'charts/tooltip',
  SET_SERIES_SETTINGS = 'charts/seriesSettings',
}

/* --- Actions Interfaces --- */

interface ActionAdd {
  type: ChartsActions.ADD,
  formID: FormID,
}
interface ActionSetTooltipVisible {
  type: ChartsActions.SET_TOOLTIP_VISIBLE,
  formID: FormID,
  payload: boolean,
}
interface ActionSetSeriesSetting {
  type: ChartsActions.SET_SERIES_SETTINGS,
  formID: FormID,
  payload: any,
}

export type ChartsAction = ActionAdd | ActionSetTooltipVisible | ActionSetSeriesSetting;

/* --- Reducer --- */

const defaultChartState: ChartState = {tooltip: true, seriesSettings: undefined};

export const chartsReducer = (state: ChartsState = {}, action: ChartsAction): ChartsState => {
  switch (action.type) {

    case ChartsActions.ADD: {
      return {...state, [action.formID]: {...defaultChartState}};
    }

    case ChartsActions.SET_TOOLTIP_VISIBLE: {
      const newChartState = state[action.formID];
      return {...state, [action.formID]: {...newChartState, tooltip: action.payload}};
    }

    case ChartsActions.SET_SERIES_SETTINGS: {
      const newChartState = state[action.formID];
      return {...state, [action.formID]: {...newChartState, seriesSettings: action.payload}};
    }

    default: return state;
  }
}
