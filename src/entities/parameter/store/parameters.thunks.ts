import type { ParameterUpdateEntries } from '../lib/parameter.types';
import { uniqueArray } from 'shared/lib';
import { useChannelStore, reloadChannels } from 'entities/channel';
import { reloadReportChannels, updateReportsVisibility } from 'entities/report';
import { updateObjects } from 'entities/objects';
import { clientAPI } from 'entities/client';
import { fillParamValues, findDependentParameters } from '../lib/utils';
import { parseParameterValue } from '../lib/factory';
import { updateParams } from './parameters.actions';
import { updatePresentationTreeVisibility } from 'widgets/left-panel/store/left-panel.thunks';
import { rowToParameterValue } from '../impl/table-row';
import { useRootStore } from '../../../app/store/root-form.store';
import { useParameterStore } from './parameter.store';


/** Обновление параметра и всех его зависимостей. */
export async function updateParamDeep(clientID: ClientID, id: ParameterID, newValue: any): Promise<void> {
  const initState = useParameterStore.getState()
  const clientParameters = initState[clientID];
  const parameter = clientParameters?.find(p => p.id === id);

  if (!parameter) return;
  const dateChanging = useRootStore.getState().settings.dateChanging;

  const relatedChannels: Set<ChannelName> = new Set(parameter.relatedChannels);
  const relatedReports: Set<ReportID> = new Set(parameter.relatedReports);
  const relatedReportChannels: RelatedReportChannels[] = [...parameter.relatedReportChannels];

  const updateParamData: ParameterUpdateEntries[] = [{clientID, id, value: newValue}];
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
    parameter.setValue(newValue);
    await Promise.all(parameter.relatedSetters.map(async (setter) => {
      const clients = [setter.clientID, 'root'];
      const values = fillParamValues(setter.parametersToExecute, initState, clients);
      const rawValue = await clientAPI.executeLinkedProperty(setter.clientID, values, setter.index);

      const [parameter] = fillParamValues([setter.parameterToSet], initState, clients);
      const value = parseParameterValue(rawValue, parameter.type);
      updateParamData.push({id: parameter.id, clientID: setter.clientID, value});

      parameter.relatedChannels?.forEach(c => relatedChannels.add(c));
      parameter.relatedReports?.forEach(r => relatedReports.add(r));
      parameter.relatedReportChannels?.forEach(x => relatedReportChannels.push(x));
    }));
  }

  const updatedIDs = new Set(updateParamData.map(d => d.id));
  updateParams(updateParamData);

  if (relatedChannels.size) {
    await reloadChannels([...relatedChannels]);
  }
  if (relatedReportChannels.length) {
    await reloadReportChannels(relatedReportChannels);
  }

  const dependentParameters = findDependentParameters(id, useParameterStore.getState());
  updateObjects([{clientID, id, value: newValue}]);

  const channels = useChannelStore.getState();
  const entries: ParameterUpdateEntries[] = [];
  const reportEntries: RelatedReportChannels[] = [];
  const channelsToUpdate = new Set<ChannelName>();

  for (const clientID in dependentParameters) {
    const updatedList = dependentParameters[clientID];
    for (const updatedParam of updatedList) {
      if (updatedIDs.has(updatedParam.id)) continue;
      const updateData: ParameterUpdateEntries = {clientID, id: updatedParam.id, value: null};

      if (updatedParam.editor?.canBeNull === false && updatedParam.channelName) {
        const channel = channels[updatedParam.channelName];
        const row = channel?.data?.rows?.at(0);
        if (row) updateData.value = rowToParameterValue(row, channel) ?? null;
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
  updatePresentationTreeVisibility(fullUpdateIDs);

  if (entries.length) {
    updateParams(entries);
    updateObjects(entries);
  }
  if (reportEntries.length) {
    reloadReportChannels(reportEntries).then();
  }
  if (channelsToUpdate.size) {
    reloadChannels([...channelsToUpdate]).then();
  }
  if (relatedReports.size) {
    updateReportsVisibility([...relatedReports]).then();
  }
}

function dateChangingValue(dateChanging: DateChangingPlugin, value: any, type: ParameterType): ParameterValueMap['dateInterval'] | null {
  if (value === null) return null;
  let year: number;

  if (type === 'date') {
    year = value.getFullYear();
  } else if (type === 'tableRow' && dateChanging.columnName) {
    const cellValue = value[dateChanging.columnName]?.value;
    if (typeof cellValue === 'number') year = cellValue;
  } else if (type === 'integer') {
    year = value;
  }
  if (year === undefined) return null;

  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  };
}
