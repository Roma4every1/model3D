import { Dispatch } from 'redux';
import { Thunk, StateGetter, uniqueArray } from 'shared/lib';
import { reloadChannels } from '../../channels';
import { reloadReportChannels, updateReportsVisibility } from '../../reports';
import { updateObjects } from '../../objects';
import { findDependentParameters } from '../lib/utils';
import { stringToTableCell, tableRowToString } from '../lib/table-row';
import { updateParam, updateParams } from './parameters.actions';
import { updatePresentationTreeVisibility } from 'widgets/left-panel/store/left-panel.thunks';


/** Обновление параметра и всех его зависимостей.
 * + зависимые параметры
 * + зависимые каналы
 * + зависимые программы отчёты
 * */
export function updateParamDeep(clientID: ClientID, id: ParameterID, newValue: any): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const initState = getState();
    const clientParameters = initState.parameters[clientID];
    const parameter = clientParameters?.find(p => p.id === id);

    if (!parameter) return;
    const dateChanging = initState.root.settings.dateChanging;
    let { relatedChannels, relatedReportChannels, relatedReports } = parameter;

    if (dateChanging?.year === id) {
      const dateIntervalID = dateChanging.dateInterval;
      const dateInterval = clientParameters.find(p => p.id === dateIntervalID);
      const dateIntervalNewValue = dateChangingValue(dateChanging, newValue, parameter.type);

      relatedChannels = uniqueArray(relatedChannels, dateInterval.relatedChannels);
      relatedReportChannels = uniqueArray(relatedReportChannels, dateInterval.relatedReportChannels);
      relatedReports = uniqueArray(relatedReports, dateInterval.relatedReports);

      const entries = [
        {clientID, id: id, value: newValue},
        {clientID, id: dateIntervalID, value: dateIntervalNewValue},
      ];
      dispatch(updateParams(entries));
    } else {
      dispatch(updateParam(clientID, id, newValue));
    }

    if (relatedChannels.length) {
      await reloadChannels(relatedChannels)(dispatch, getState);
    }
    if (relatedReportChannels.length) {
      await reloadReportChannels(relatedReportChannels)(dispatch, getState);
    }

    const state = getState();
    const dependentParameters = findDependentParameters(id, state.parameters);
    updateObjects([{clientID, id, value: newValue}], dispatch, state);

    const channels = getState().channels;
    const entries: UpdateParamData[] = [];
    const reportEntries: RelatedReportChannels[] = [];
    const channelsToUpdate = new Set<ChannelName>();
    const reportsToUpdate = new Set(relatedReports);

    for (const clientID in dependentParameters) {
      const updatedList = dependentParameters[clientID];
      for (const updatedParam of updatedList) {
        const updateData: UpdateParamData = {clientID, id: updatedParam.id, value: null};

        if (updatedParam.canBeNull === false && updatedParam.externalChannelName) {
          const channel = channels[updatedParam.externalChannelName];
          const row = channel?.data?.rows?.at(0);
          if (row) updateData.value = tableRowToString(channel, row) ?? null;
        }
        entries.push(updateData);
        updatedParam.relatedChannels?.forEach(channelName => channelsToUpdate.add(channelName));
        updatedParam.relatedReports?.forEach(reportID => reportsToUpdate.add(reportID));

        if (updatedParam.relatedReportChannels.length) {
          reportEntries.push(...updatedParam.relatedReportChannels);
        }
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

function dateChangingValue(dateChanging: DateChangingPlugin, value: any, type: ParameterType): ParamValueDateInterval | null {
  if (value === null) return null;
  let year: number;

  if (type === 'date') {
    year = value.getFullYear();
  } else if (type === 'tableRow' && dateChanging.columnName) {
    year = parseInt(stringToTableCell(value, dateChanging.columnName))
  } else if (type === 'integer') {
    year = value;
  }
  if (year === undefined) return null;

  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  };
}
