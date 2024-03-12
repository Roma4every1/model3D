import { Dispatch } from 'redux';
import { Thunk, StateGetter, uniqueArray } from 'shared/lib';
import { reloadChannels } from 'entities/channels';
import { reloadReportChannels, updateReportsVisibility } from 'entities/reports';
import { updateObjects } from 'entities/objects';
import { fillParamValues, findDependentParameters } from '../lib/utils';
import { stringToTableCell, tableRowToString } from '../lib/table-row';
import { updateParams } from './parameters.actions';
import { updatePresentationTreeVisibility } from 'widgets/left-panel/store/left-panel.thunks';
import { getParsedParamValue } from '../lib/parsing.ts';
import { formsAPI } from 'widgets/presentation/lib/forms.api.ts';


/** Обновление параметра и всех его зависимостей.
 * + зависимые параметры
 * + зависимые каналы
 * + зависимые программы и отчёты
 * */
export function updateParamDeep(clientID: ClientID, id: ParameterID, newValue: any): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const initState = getState();
    const clientParameters = initState.parameters[clientID];
    const parameter = clientParameters?.find(p => p.id === id);

    if (!parameter) return;
    const dateChanging = initState.root.settings.dateChanging;

    const relatedChannels: Set<ChannelName> = new Set(parameter.relatedChannels);
    const relatedReports: Set<ReportID> = new Set(parameter.relatedReports);
    const relatedReportChannels: RelatedReportChannels[] = [...parameter.relatedReportChannels];

    const updateParamData: UpdateParamData[] = [{clientID, id, value: newValue}];
    if (dateChanging?.year === id) {
      const dateIntervalID = dateChanging.dateInterval;
      const dateInterval = clientParameters.find(p => p.id === dateIntervalID);
      const dateIntervalNewValue = dateChangingValue(dateChanging, newValue, parameter.type);

      dateInterval.relatedChannels?.forEach(c => relatedChannels.add(c));
      dateInterval.relatedReports?.forEach(r => relatedReports.add(r));
      dateInterval.relatedReportChannels?.forEach(x => relatedReportChannels.push(x));
      updateParamData.push({clientID, id: dateIntervalID, value: dateIntervalNewValue});
    }
    if (parameter.relatedSetters) {
      parameter.value = newValue;
      await Promise.all(parameter.relatedSetters.map(async (setter) => {
        const clients = [setter.clientID, initState.root.id];
        const values = fillParamValues(setter.parametersToExecute, initState.parameters, clients);
        const rawValue = await formsAPI.executeLinkedProperty(setter.clientID, values, setter.index);

        const [parameter] = fillParamValues([setter.parameterToSet], initState.parameters, clients);
        const value = getParsedParamValue(parameter.type, rawValue);
        updateParamData.push({id: parameter.id, clientID: setter.clientID, value});

        parameter.relatedChannels?.forEach(c => relatedChannels.add(c));
        parameter.relatedReports?.forEach(r => relatedReports.add(r));
        parameter.relatedReportChannels?.forEach(x => relatedReportChannels.push(x));
      }));
    }

    const updatedIDs = new Set(updateParamData.map(d => d.id));
    dispatch(updateParams(updateParamData));

    if (relatedChannels.size) {
      await reloadChannels([...relatedChannels])(dispatch, getState);
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

    for (const clientID in dependentParameters) {
      const updatedList = dependentParameters[clientID];
      for (const updatedParam of updatedList) {
        if (updatedIDs.has(updatedParam.id)) continue;
        const updateData: UpdateParamData = {clientID, id: updatedParam.id, value: null};

        if (updatedParam.canBeNull === false && updatedParam.externalChannelName) {
          const channel = channels[updatedParam.externalChannelName];
          const row = channel?.data?.rows?.at(0);
          if (row) updateData.value = tableRowToString(channel, row) ?? null;
        }
        entries.push(updateData);
        updatedParam.relatedChannels?.forEach(channelName => channelsToUpdate.add(channelName));
        updatedParam.relatedReports?.forEach(reportID => relatedReports.add(reportID));

        if (updatedParam.relatedReportChannels.length) {
          reportEntries.push(...updatedParam.relatedReportChannels);
        }
      }
    }

    const fullUpdateIDs = uniqueArray(updatedIDs, entries.map(item => item.id));
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
    if (relatedReports.size) {
      updateReportsVisibility([...relatedReports])(dispatch, getState).then();
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
