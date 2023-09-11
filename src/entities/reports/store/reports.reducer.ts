/* --- Action Types --- */

export enum ReportActionType {
  SET = 'reports/set',
  INITIALIZE = 'reports/init',
  SET_FIELD = 'reports/field',
  UPDATE_PARAMETER = 'reports/parameter',
  SET_OPERATION_STATUS = 'reports/status',
  CLEAR_OPERATIONS = 'reports/operations',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: ReportActionType.SET;
  payload: {clientID: ClientID, models: ReportModel[]};
}
interface ActionInitializeReport {
  type: ReportActionType.INITIALIZE;
  payload: {clientID: ClientID, id: ReportID, initData: ReportInitData};
}
interface ActionSetField {
  type: ReportActionType.SET_FIELD;
  payload: {clientID: ClientID, reportID: ReportID, field: keyof ReportModel, value: any};
}
interface ActionUpdateParam {
  type: ReportActionType.UPDATE_PARAMETER;
  payload: {clientID: ClientID, reportID: ReportID, parameterID: ParameterID, value: any};
}
interface ActionSetOperationStatus {
  type: ReportActionType.SET_OPERATION_STATUS;
  payload: Partial<OperationStatus>;
}
interface ActionClearOperations {
  type: ReportActionType.CLEAR_OPERATIONS;
  payload: FormID | null;
}

export type ReportAction = ActionSet | ActionInitializeReport | ActionSetField |
  ActionUpdateParam | ActionSetOperationStatus | ActionClearOperations;

/* --- Init State & Reducer --- */

const init: Reports = {models: {}, operations: []};

export function reportsReducer(state: Reports = init, action: ReportAction): Reports {
  switch (action.type) {

    case ReportActionType.SET: {
      const { clientID, models } = action.payload;
      return {...state, models: {...state.models, [clientID]: models}};
    }

    case ReportActionType.INITIALIZE: {
      const { clientID, id, initData } = action.payload;
      const models = state.models[clientID];

      const index = models.findIndex(model => model.id === id);
      if (index === -1) return state;

      models[index] = {...models[index], ...initData};
      return {...state, models: {...state.models, [clientID]: [...models]}};
    }

    case ReportActionType.SET_FIELD: {
      const { clientID, reportID, field, value } = action.payload;
      const models = state.models[clientID];

      const index = models.findIndex(model => model.id === reportID);
      if (index === -1) return state;

      models[index] = {...models[index], [field]: value};
      return {...state, models: {...state.models, [clientID]: [...models]}};
    }

    case ReportActionType.UPDATE_PARAMETER: {
      const { clientID, reportID, parameterID, value } = action.payload;
      const parameters = state.models[clientID].find(model => model.id === reportID).parameters;
      const index = parameters.findIndex(p => p.id === parameterID);
      parameters[index] = {...parameters[index], value};
      return {...state};
    }

    case ReportActionType.SET_OPERATION_STATUS: {
      const status = action.payload;
      const operationID = status.id;

      const operations = state.operations;
      const index = state.operations.findIndex(o => o.id === operationID);
      if (index === -1) return {...state, operations: [status as OperationStatus, ...operations]};

      operations[index] = {...operations[index], ...status};
      return {...state, operations: [...operations]};
    }

    case ReportActionType.CLEAR_OPERATIONS: {
      const id = action.payload;
      if (!id) return {...state, operations: []};
      const operations = state.operations.filter(o => o.clientID !== id);
      return {...state, operations};
    }

    default: return state;
  }
}
