import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { reloadChannels } from '../../channels';
import { updateReportsVisibility } from '../../reports';
import { clearDependentParameters } from '../lib/utils';
import { updateParam, updateParams } from './parameters.actions';


/** Обновление параметра и всех его зависимостей.
 * + зависимые параметры
 * + зависимые каналы
 * + зависимые программы отчёты
 * */
export const updateParamDeep = (clientID: FormID, paramID: ParameterID, newValue: any): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState(), stateGetter = () => state;
    const paramDict = state.parameters;
    const parameter = paramDict[clientID]?.find(p => p.id === paramID);

    if (!parameter) return;
    const { id, relatedChannels, relatedReports } = parameter;
    const channelsToUpdate = new Set(relatedChannels), reportsToUpdate = new Set(relatedReports);

    const updatedList: Parameter[] = [];
    clearDependentParameters(id, paramDict[clientID], updatedList);

    if (updatedList.length) {
      const entries: UpdateParamData[] = [{clientID, id: paramID, value: newValue}];
      for (const updatedParam of updatedList) {
        entries.push({clientID, id: updatedParam.id, value: null});
        updatedParam.relatedChannels?.forEach(channelName => channelsToUpdate.add(channelName));
        updatedParam.relatedReports?.forEach(reportID => reportsToUpdate.add(reportID));
      }
      dispatch(updateParams(entries));
    } else {
      dispatch(updateParam(clientID, id, newValue));
    }

    if (channelsToUpdate.size)
      reloadChannels([...channelsToUpdate])(dispatch, stateGetter).then();
    if (reportsToUpdate.size)
      updateReportsVisibility([...reportsToUpdate])(dispatch, stateGetter).then();
  };
};
