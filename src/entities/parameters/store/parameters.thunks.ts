import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { reloadChannels } from '../../channels';
import { reloadReportChannels, updateReportsVisibility } from '../../reports';
import { updateObjects } from '../../objects';
import { findDependentParameters } from '../lib/utils';
import { tableRowToString } from '../lib/table-row';
import { updateParam, updateParams } from './parameters.actions';
import { updatePresentationTreeVisibility } from 'widgets/left-panel/store/left-panel.thunks';


/** Обновление параметра и всех его зависимостей.
 * + зависимые параметры
 * + зависимые каналы
 * + зависимые программы отчёты
 * */
export function updateParamDeep(clientID: ClientID, id: ParameterID, newValue: any): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const clientParameters = getState().parameters[clientID];
    const parameter = clientParameters?.find(p => p.id === id);

    if (!parameter) return;
    const { relatedChannels, relatedReportChannels, relatedReports } = parameter;
    dispatch(updateParam(clientID, id, newValue));

    if (relatedChannels.length) {
      await reloadChannels(relatedChannels)(dispatch, getState);
    }
    if (relatedReportChannels.length) {
      await reloadReportChannels(relatedReportChannels)(dispatch, getState);
    }
    updateObjects([{clientID, id, value: newValue}], dispatch, getState());

    const channels = getState().channels;
    const entries: UpdateParamData[] = [];
    const reportEntries: RelatedReportChannels[] = [];
    const channelsToUpdate = new Set<ChannelName>();
    const reportsToUpdate = new Set(relatedReports);

    const updatedList = [];
    findDependentParameters(id, clientParameters, updatedList);

    for (const updatedParam of updatedList) {
      const updateData: UpdateParamData = {clientID, id: updatedParam.id, value: null};

      if (updatedParam.canBeNull === false && updatedParam.externalChannelName) {
        const channel = channels[updatedParam.externalChannelName];
        const row = channel?.data?.rows?.at(0);
        if (row) updateData.value = tableRowToString(channel, row) ?? null;
      }
      entries.push(updateData);
      updatedParam.relatedChannels?.forEach((channelName) => channelsToUpdate.add(channelName));
      updatedParam.relatedReports?.forEach((reportID) => reportsToUpdate.add(reportID));

      if (updatedParam.relatedReportChannels.length) {
        reportEntries.push(...updatedParam.relatedReportChannels);
      }
    }

    const fullUpdateIDs = [id, ...entries.map(item => item.id)];
    updatePresentationTreeVisibility(fullUpdateIDs)(dispatch, getState).then();

    if (entries.length) {
      dispatch(updateParams(entries));
      updateObjects(entries, dispatch, getState());
    }
    if (reportEntries.length) {
      reloadReportChannels(reportEntries)(dispatch, getState).then();
    }
    if (channelsToUpdate.size) {
      reloadChannels([...channelsToUpdate])(dispatch, getState).then();
    }
    if (reportsToUpdate.size) {
      updateReportsVisibility([...reportsToUpdate])(dispatch, getState).then();
    }
  };
}
