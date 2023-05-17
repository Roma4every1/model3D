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

    const { parameters, channels } = getState();
    const entries: UpdateParamData[] = [];
    const channelsToUpdate = new Set<ChannelName>();
    const reportsToUpdate = new Set(relatedReports);

    const rowParams = getCurrentRowParams(relatedChannels, parameters, channels);
    const updatedList = rowParams.map((item) => item.parameter);
    findDependentParameters(id, clientParameters, updatedList);

    for (const updatedParam of updatedList) {
      let channel: Channel;
      const updateData: UpdateParamData = {clientID, id: updatedParam.id, value: null};

      if (updatedParam.canBeNull === false && updatedParam.externalChannelName) {
        channel = channels[updatedParam.externalChannelName];
      } else {
        const rowParamItem = rowParams.find((item) => item.parameter === updatedParam);
        if (rowParamItem) {
          channel = rowParamItem.channel;
          updateData.clientID = rowParamItem.clientID;
        }
      }
      if (channel) {
        const rows = channel?.data?.rows;
        if (rows?.length) updateData.value = tableRowToString(channel, rows[0])?.value ?? null;
      }

      entries.push(updateData);
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

function getCurrentRowParams(names: ChannelName[], paramDict: ParamDict, channelDict: ChannelDict) {
  const ids: ParameterID[] = [];
  const result: {clientID: FormID, parameter: Parameter, channel: Channel}[] = [];

  for (const name of names) {
    const channel = channelDict[name];
    const rowParam = channel.info.currentRowObjectName;

    if (rowParam) {
      ids.push(rowParam);
      result.push({clientID: null, parameter: null, channel});
    }
  }

  ids.forEach((id, i) => {
    for (const clientID in paramDict) {
      const neededParam = paramDict[clientID].find(p => p.id === id);
      if (neededParam) {
        result[i].clientID = clientID;
        result[i].parameter = neededParam;
        return;
      }
    }
  });
  return result;
}
