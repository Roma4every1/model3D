import i18n from "../locales/i18n";
import { uniq } from "lodash";
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
    if (!modifiedTables) return;
    const channelsData = store.getState().channelsData;

    for (const channelName in allChannelsForms) {
      for (const formID in allChannelsForms[channelName]) {
        const tableID = channelsData[channelName]?.tableId;
        if (allChannelsForms[channelName][formID] && tableID && modifiedTables.includes(tableID)) {
          await loadAllChannelData(channelName, formID, baseChannelName !== channelName);
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

    const sessionManager = store.getState().sessionManager;
    const neededParamValues = sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId, false, channelName);

    let isEqualParams = equalParams(channelsParamsValues[formId + '_' + channelName], neededParamValues.map(np => np.value));
    let changed = !channelsParamsValues[formId + '_' + channelName] || !isEqualParams || force;
    if (!changed) return false;

    store.dispatch(actions.setChannelsLoading(channelName, true));
    channelsParamsValues[formId + '_' + channelName] = neededParamValues.map(np => np.value);

    const { ok, data: channelData } = await API.channels.getChannelData(channelName, neededParamValues);
    if (!ok) store.dispatch(actions.setWindowWarning(channelData));

    const modifiedTables = channelData?.data?.ModifiedTables.ModifiedTables;
    if (modifiedTables?.length) await updateTables(modifiedTables, channelName);

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
      store.dispatch(actions.setChannelsData(channelName, channelData));
    }

    store.dispatch(actions.setChannelsLoading(channelName, false));
    return true;
  }

  const updateTablesByResult = (tableId, operationResult) => {
    if (operationResult) {
      if (!operationResult['WrongResult']) {
        updateTables([tableId, ...operationResult?.ModifiedTables?.ModifiedTables]).then();
      } else {
        store.dispatch(actions.setWindowError(i18n.t('messages.dataSaveError')));
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
    const { ok, data } = await API.channels.getNewRow(tableID);
    if (!ok) store.dispatch(actions.setWindowWarning(data));
    return data;
  }

  const insertRow = async (tableID, dataJSON) => {
    const { ok, data } = await API.channels.insertRow(tableID, dataJSON);
    if (ok) return updateTablesByResult(tableID, data);
    store.dispatch(actions.setWindowWarning(data));
  }

  const updateRow = async (tableID, editID, newRowData) => {
    const { ok, data } = await API.channels.updateRow(tableID, editID, newRowData);
    if (ok) return updateTablesByResult(tableID, data);
    store.dispatch(actions.setWindowWarning(data));
  }

  const deleteRows = async (tableID, elementsToRemove, removeAll) => {
    const { ok, data } = await API.channels.removeRows(tableID, elementsToRemove, String(!!removeAll));
    if (ok) return updateTablesByResult(tableID, data);
    store.dispatch(actions.setWindowWarning(data));
  }

  const getStatistics = async (tableID, columnName) => {
    const { ok, data } = await API.channels.getStatistics(tableID, columnName);
    if (ok) return data;
    store.dispatch(actions.setWindowWarning(data));
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
    setFormInactive,
    updateTables,
    insertRow, updateRow, deleteRows,
    getStatistics, getNewRow, getAllChannelParams
  };
}
