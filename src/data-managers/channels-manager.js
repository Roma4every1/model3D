import i18n from "../locales/i18n";
import { findIndex, uniq } from "lodash";
import { equalParams } from "../utils/utils";
import { actions } from "../store";
import { API } from "../api/api";


export default function createChannelsManager(store) {
  /* `{[key: string]: ???}` */
  const allChannelsForms = {};
  /* `{[key: string]: string[]}` */
  const channelsParams = {};
  /* `{[key: string]: string[]}` */
  const channelsParamsValues = {};

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

  const updateTables = async (modifiedTables, baseChannelName) => {
    for (let channelName in allChannelsForms) {
      for (let formId in allChannelsForms[channelName]) {
        if (allChannelsForms[channelName][formId] && store.getState().channelsData[channelName] && modifiedTables?.includes(store.getState().channelsData[channelName].tableId)) {
          await loadAllChannelData(channelName, formId, baseChannelName !== channelName);
        }
      }
    }
  }

  const loadAllChannelData = async (channelName, formId, force) => {
    if (!allChannelsForms[channelName]) {
      allChannelsForms[channelName] = [];
    }
    allChannelsForms[channelName][formId] = true;

    if (!channelsParams[channelName]) {
      const { data: channelParamsList } = await API.channels.getChannelParameters(channelName);
      channelsParams[channelName] = channelParamsList ?? [];
    }

    const neededParamValues = store.getState().sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId, false, channelName);

    let isEqualParams = equalParams(channelsParamsValues[formId + '_' + channelName], neededParamValues.map(np => np.value));
    let changed = !channelsParamsValues[formId + '_' + channelName] || !isEqualParams || force;

    if (changed) {
      store.dispatch(actions.setChannelsLoading(channelName, true));
      channelsParamsValues[formId + '_' + channelName] = neededParamValues.map(np => np.value);

      const { data: channelData } = await API.channels.getChannelData(channelName, neededParamValues);
      if (channelData && channelData.data && channelData.data['ModifiedTables'] && channelData.data['ModifiedTables']['ModifiedTables']) {
        await updateTables(channelData.data['ModifiedTables']['ModifiedTables'], channelName);
      }

      let idIndex = 0, nameIndex = -1, parentIndex = -1;
      let codeColumnName = 'LOOKUPCODE';
      let valueColumnName = 'LOOKUPVALUE';
      let parentColumnName = 'LOOKUPPARENTCODE';

      if (channelData?.properties) {
        let codePropertyColumnName = channelData.properties.find(p => p.name.toUpperCase() === codeColumnName);
        let valuePropertyColumnName = channelData.properties.find(p => p.name.toUpperCase() === valueColumnName);
        let parentPropertyColumnName = channelData.properties.find(p => p.name.toUpperCase() === parentColumnName);

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

      if (channelData?.data?.Columns) {
        idIndex = findIndex(channelData.data.Columns, (o) => o.Name.toUpperCase() === codeColumnName);
        nameIndex = findIndex(channelData.data.Columns, (o) => o.Name.toUpperCase() === valueColumnName);
        parentIndex = findIndex(channelData.data.Columns, (o) => o.Name.toUpperCase() === parentColumnName);
        if (nameIndex < 0) {
          nameIndex = idIndex;
        }
      }

      if (channelData) {
        channelData.idIndex = idIndex;
        channelData.nameIndex = nameIndex;
        channelData.parentIndex = parentIndex;
      }

      if (channelData && channelData.properties) {
        await Promise.all(
          channelData.properties.map(async (property) => {
            if (property.lookupChannelName) {
              const lookupChanged = await loadAllChannelData(property.lookupChannelName, formId, false);
              if (lookupChanged) changed = true;

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
        store.dispatch(actions.setChannelsData(channelName, channelData));
      }
      store.dispatch(actions.setChannelsLoading(channelName, false));
    }
    return changed;
  }

  const updateTablesByResult = (tableId, operationResult) => {
    if (operationResult) {
      if (!operationResult['WrongResult']) {
        updateTables([tableId, ...operationResult?.ModifiedTables?.ModifiedTables]).then();
      } else {
        store.getState().sessionManager.handleWindowError(i18n.t('messages.dataSaveError'));
      }
    } else {
      //reject
      updateTables([tableId]).then();
    }
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

  const getNewRow = async (tableID) => {
    const { data } = await API.channels.getNewRow(tableID);
    return data;
  }

  const insertRow = async (tableID, dataJSON) => {
    const { data } = await API.channels.insertRow(tableID, dataJSON);
    updateTablesByResult(tableID, data);
  }

  const updateRow = async (tableID, editID, newRowData) => {
    const { data } = await API.channels.updateRow(tableID, editID, newRowData);
    updateTablesByResult(tableID, data);
  }

  const deleteRows = async (tableID, elementsToRemove, removeAll) => {
    const { data } = await API.channels.removeRows(tableID, elementsToRemove, String(!!removeAll));
    updateTablesByResult(tableID, data);
  }

  const getStatistics = async (tableID, columnName) => {
    const { data } = await API.channels.getStatistics(tableID, columnName);
    return data;
  }

  // автообновление данных каналов при обновлении параметров
  store.subscribe(async () => {
    for (let channelName in allChannelsForms) {
      for (let formId in allChannelsForms[channelName]) {
        if (allChannelsForms[channelName][formId]) {
          if (!store.getState().channelsLoading[channelName]?.loading) {
            await loadAllChannelData(channelName, formId, false);
          }
        }
      }
    }
  });

  return {
    loadFormChannelsList, loadAllChannelData,
    setFormInactive,
    updateTables,
    insertRow, updateRow, deleteRows,
    getStatistics, getNewRow, getAllChannelParams
  };
}
