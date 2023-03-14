import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { reloadChannels } from '../../channels';
import { updateReportsVisibility } from '../../reports';
import { findDependentParameters } from '../lib/utils';
import { tableRowToString } from '../lib/table-row';
import { updateParam, updateParams } from './parameters.actions';


/** Обновление параметра и всех его зависимостей.
 * + зависимые параметры
 * + зависимые каналы
 * + зависимые программы отчёты
 * */
export const updateParamDeep = (clientID: FormID, id: ParameterID, newValue: any): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const clientParameters = getState().parameters[clientID];
    const parameter = clientParameters?.find(p => p.id === id);

    if (!parameter) return;
    const { relatedChannels, relatedReports } = parameter;
    dispatch(updateParam(clientID, id, newValue));
    if (relatedChannels.length) await reloadChannels(relatedChannels)(dispatch, getState);

    const updatedList: Parameter[] = [];
    findDependentParameters(id, clientParameters, updatedList);

    const channels = getState().channels;
    const entries: UpdateParamData[] = [];
    const channelsToUpdate = new Set<ChannelName>();
    const reportsToUpdate = new Set(relatedReports);

    for (const updatedParam of updatedList) {
      let value = null;
      if (updatedParam.canBeNull === false && updatedParam.externalChannelName) {
        const channel = channels[updatedParam.externalChannelName];
        const rows = channel?.data?.rows;
        if (rows?.length) value = tableRowToString(channel, rows[0])?.value ?? null;
      }
      entries.push({clientID, id: updatedParam.id, value});
      updatedParam.relatedChannels?.forEach((channelName) => channelsToUpdate.add(channelName));
      updatedParam.relatedReports?.forEach((reportID) => reportsToUpdate.add(reportID));
    }

    if (entries.length)
      dispatch(updateParams(entries));
    if (channelsToUpdate.size)
      reloadChannels([...channelsToUpdate])(dispatch, getState).then();
    if (reportsToUpdate.size)
      updateReportsVisibility([...reportsToUpdate])(dispatch, getState).then();
  };
};
