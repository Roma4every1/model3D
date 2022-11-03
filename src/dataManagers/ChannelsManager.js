import i18n from "../locales/i18n";
import { findIndex, uniq } from "lodash";
import { equalParams } from "../utils/utils";
import { actions } from "../store";


export default function createChannelsManager(store) {
  /* `{[key: string]: ???}` */
  const allChannelsForms = {};
  /* `{[key: string]: string[]}` */
  const channelsParams = {};
  /* `{[key: string]: string[]}` */
  const channelsParamsValues = {};

  const loadFormChannelsList = async (formId) => {
    const sessionId = store.getState().sessionId;
    const data = await store.getState().sessionManager
      .fetchData(`getChannelsForForm?sessionId=${sessionId}&formId=${formId}`);
    await Promise.all(data.map(async (channel) => await loadAllChannelData(channel, formId, false)));
    return data;
  }

  const loadChannelParamsList = async (channelName) => {
    const sessionId = store.getState().sessionId;
    return await store.getState().sessionManager
      .fetchData(`getNeededParamForChannel?sessionId=${sessionId}&channelName=${channelName}`);
  }

  /* channelName: string, paramValues: Param[]*/
  const loadChannelData = async (channelName, paramValues) => {
    const sessionId = store.getState().sessionId;
    return await store.getState().sessionManager.fetchData('getChannelDataByName', {
      method: 'POST',
      body: JSON.stringify({sessionId, channelName, paramValues})
    });
  }

  const setFormInactive = async (inputFormId) => {
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
      const channelParamsList = await loadChannelParamsList(channelName);
      channelsParams[channelName] = channelParamsList ?? [];
    }

    const neededParamValues = store.getState().sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId, false, channelName);

    let isEqualParams = equalParams(channelsParamsValues[formId + '_' + channelName], neededParamValues.map(np => np.value));
    let changed = !channelsParamsValues[formId + '_' + channelName] || !isEqualParams || force;

    if (changed) {
      store.dispatch(actions.setChannelsLoading(channelName, true));
      channelsParamsValues[formId + '_' + channelName] = neededParamValues.map(np => np.value);

      const channelData = await loadChannelData(channelName, neededParamValues);
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
    const sessionId = store.getState().sessionId;
    return await store.getState().sessionManager.fetchData(`getNewRow?sessionId=${sessionId}&tableId=${tableID}`);
  }

  const insertRow = async (tableID, dataJSON) => {
    const sessionId = store.getState().sessionId;
    const data = await store.getState().sessionManager.fetchData(`insertRow?sessionId=${sessionId}&tableId=${tableID}&rowData=${dataJSON}`);
    updateTablesByResult(tableID, data);
  }

  const updateRow = async (tableID, editID, newRowData) => {
    const sessionID = store.getState().sessionId;
    const data = await store.getState().sessionManager.fetchData('updateRow',
      {
        method: 'POST',
        body: JSON.stringify({sessionId: sessionID, tableId: tableID, rowsIndices: editID, newRowData}),
      });
    updateTablesByResult(tableID, data);
  }

  const deleteRows = async (tableID, elementsToRemove, removeAll) => {
    const sessionId = store.getState().sessionId;
    const data = await store.getState().sessionManager.fetchData(`removeRows?sessionId=${sessionId}&tableId=${tableID}&rows=${elementsToRemove}&removeAll=${!!removeAll}`);
    updateTablesByResult(tableID, data);
  }

  const getStatistics = async (tableId, columnName) => {
    const sessionId = store.getState().sessionId;
    return await store.getState().sessionManager.fetchData(`getStatistics?sessionId=${sessionId}&tableId=${tableId}&columnName=${columnName}`);
  }

  // будет вызываться каждый раз при отправке действия (и когда состояние могло измениться)
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
