import { uniq } from 'lodash';
import { setChannelsLoading, setChannelsData } from '../../app/store';
import { setWindowWarning } from '../../app/store';
import { API } from '../../api';


const equalParams = (p1, p2) => {
  if (!p1 || !p2 || p1.length !== p2.length) return false;

  for (let i = 0; i < p1.length; i++) {
    if (p1[i] !== p2[i]) return false;
  }
  return true;
}

export default function createChannelsManager(store) {
  /** @type Record<ChannelName, Record<FormID, boolean>> */
  let allChannelsForms = {};
  /** @type Record<ChannelName, ParameterID[]> */
  let channelsParams = {};
  /** @type Record<string, any[]> */
  let channelsParamsValues = {};

  const loadFormChannelsList = async (formID) => {
    const res = await API.forms.getFormChannelsList(formID);
    if (!res.ok) return [];
    const mapper = async (channel) => await loadAllChannelData(channel, formID, false);
    await Promise.all(res.data.map(mapper));
    return res.data;
  }

  const setFormInactive = (inputFormId) => {
    for (let channelName in allChannelsForms) {
      for (let formId in allChannelsForms[channelName]) {
        if (formId === inputFormId) allChannelsForms[channelName][formId] = false;
      }
    }
  }

  const updateTables = async (modifiedTables) => {
    if (!modifiedTables) return;
    const channelsData = store.getState().channelsData;

    for (const channelName in allChannelsForms) {
      for (const formID in allChannelsForms[channelName]) {
        const tableID = channelsData[channelName]?.tableId;
        if (allChannelsForms[channelName][formID] && tableID && modifiedTables.includes(tableID)) {
          await loadAllChannelData(channelName, formID, true);
        }
      }
    }
  }

  const loadAllChannelData = async (channelName, formId, force) => {
    if (!allChannelsForms[channelName]) {
      allChannelsForms[channelName] = {};
    }
    allChannelsForms[channelName][formId] = true;

    if (!channelsParams[channelName]) {
      const { data: channelParamsList } = await API.channels.getChannelParameters(channelName);
      channelsParams[channelName] = channelParamsList ?? [];
    }

    const sessionManager = store.getState().sessionManager;
    const neededParamValues = sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId, false, channelName);

    let isEqualParams = equalParams(channelsParamsValues[formId + '_' + channelName], neededParamValues.map(np => np.value));
    let changed = !channelsParamsValues[formId + '_' + channelName] || !isEqualParams || force;
    if (!changed) return false;

    store.dispatch(setChannelsLoading(channelName, true));
    channelsParamsValues[formId + '_' + channelName] = neededParamValues.map(np => np.value);

    const { ok, data: channelData } = await API.channels.getChannelData(channelName, neededParamValues);
    if (!ok) store.dispatch(setWindowWarning(channelData));

    const columns = channelData?.data?.Columns;
    const properties = channelData?.properties;

    let codeColumnName = 'LOOKUPCODE';
    let valueColumnName = 'LOOKUPVALUE';
    let parentColumnName = 'LOOKUPPARENTCODE';

    if (properties) {
      let codePropertyColumnName, valuePropertyColumnName, parentPropertyColumnName;
      for (const property of properties) {
        const upper = property.name.toUpperCase();
        if (upper === codeColumnName) codePropertyColumnName = property;
        else if (upper === valueColumnName) valuePropertyColumnName = property;
        else if (upper === parentColumnName) parentPropertyColumnName = property;
      }

      if (codePropertyColumnName) {
        codeColumnName = codePropertyColumnName.fromColumn.toUpperCase();
      }
      if (valuePropertyColumnName) {
        valueColumnName = valuePropertyColumnName.fromColumn.toUpperCase();
      }
      if (parentPropertyColumnName) {
        parentColumnName = parentPropertyColumnName.fromColumn.toUpperCase();
      }
    }

    if (columns) {
      let idIndex = columns.findIndex(c => c.Name.toUpperCase() === codeColumnName);
      let nameIndex = columns.findIndex(c => c.Name.toUpperCase() === valueColumnName);
      if (nameIndex < 0) nameIndex = idIndex;

      channelData.idIndex = idIndex;
      channelData.nameIndex = nameIndex;
      channelData.parentIndex = columns.findIndex(c => c.Name.toUpperCase() === parentColumnName);
    }

    if (properties) {
      await Promise.all(properties.map(async (property) => {
        if (property.lookupChannelName) {
          await loadAllChannelData(property.lookupChannelName, formId, false);

          const lookupChannelData = store.getState().channelsData[property.lookupChannelName];
          if (lookupChannelData && lookupChannelData.data) {
            property.lookupData = lookupChannelData.data.Rows.map((row) => {
              const temp = {
                id: row.Cells[lookupChannelData.idIndex],
                value: row.Cells[lookupChannelData.nameIndex] ?? '',
                text: row.Cells[lookupChannelData.nameIndex] ?? '',
              };
              if (lookupChannelData.parentIndex >= 0) {
                temp.parent = row.Cells[lookupChannelData.parentIndex] ?? '';
              }
              return temp;
            });
          }
        }
      }));
      store.dispatch(setChannelsData(channelName, channelData));
    }

    store.dispatch(setChannelsLoading(channelName, false));
    return true;
  }

  const getAllChannelParams = (channelName) => {
    let result = channelsParams[channelName];
    let data = store.getState().channelsData[channelName];
    data.properties.forEach((property) => {
      if (property.lookupChannelName) {
        result = result.concat(channelsParams[property.lookupChannelName]);
      }
    });
    result = uniq(result);
    return result;
  }

  // автообновление данных каналов при обновлении параметров
  store.subscribe(async () => {
    for (let channelName in allChannelsForms) {
      for (let formID in allChannelsForms[channelName]) {
        if (allChannelsForms[channelName][formID]) {
          if (!store.getState().channelsLoading[channelName]?.loading) {
            await loadAllChannelData(channelName, formID, false);
          }
        }
      }
    }
  });

  return {
    loadFormChannelsList, loadAllChannelData,
    setFormInactive, updateTables,
    getAllChannelParams,
  };
}
