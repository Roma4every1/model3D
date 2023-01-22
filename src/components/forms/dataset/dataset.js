import React, { useState, useRef, useImperativeHandle } from "react";
import { useSelector } from "react-redux";
import DataSetView from "./dataset-view";
import { selectors, sessionManager } from "../../../store";
import { toDate } from "../../../utils/utils";


const rowConverter = (databaseData, columnsJSON, row, rowIndex) => {
  const temp = {};
  temp.js_id = rowIndex;
  if (row) {
    columnsJSON.forEach(column => {
      let i = databaseData.data.Columns.findIndex(o => o.Name === (column.fromColumn ?? column.field));
      if (i >= 0) {
        let rowValue = row.Cells[i];
        if (column.netType === 'System.DateTime' && rowValue) {
          temp[column.field] = toDate(rowValue);
        }
        else {
          if (column.lookupData) {
            const prevalue = rowValue;
            const textvalue = column.lookupData.find((c) => ('' + c.id) === ('' + prevalue))?.text;
            temp[column.field] = textvalue ?? prevalue;
            temp[column.field + '_jsoriginal'] = rowValue;
          }
          else {
            temp[column.field] = rowValue;
          }
        }
      }
    });
  }
  return temp;
};

function mapColumns(property) {
  const condition = c => c.Name === (property.fromColumn ?? property.name);
  const column = this.find(condition);

  return {
    treePath: property.treePath,
    field: property.name,
    fromColumn: property.fromColumn,
    netType: column?.NetType,
    headerName: property.displayName,
    lookupChannelName: property.lookupChannelName,
    lookupData: property.lookupData,
  };
}

function DataSet({formData, data}, ref) {
  const [activeChannelName] = useState(data.activeChannels[0]);

  /** @type Channel */
  const databaseData = useSelector(selectors.channel.bind(activeChannelName));

  const rowToAdd = useRef(null);

  const reload = async () => {
    await sessionManager.channelsManager.loadAllChannelData(activeChannelName, formData.id, true);
  };

  let columnsJSON = [];
  let rowsJSON = [];

  if (databaseData && databaseData.data && databaseData.properties) {
    columnsJSON = databaseData.properties.map(mapColumns.bind(databaseData.data.Columns));
    rowsJSON = databaseData.data.Rows.map((row, rowIndex) => {
      return rowConverter(databaseData, columnsJSON, row, rowIndex)
    });
  }

  const tableData = {
    rowsJSON: rowsJSON,
    columnsJSON: columnsJSON,
    databaseData: databaseData,
    properties: databaseData?.properties,
    currentRowObjectName: databaseData?.currentRowObjectName
  };

  async function deleteRows(elementsToRemove, removeAll) {
    await sessionManager.channelsManager.deleteRows(databaseData.tableId, elementsToRemove, removeAll);
  }

  async function apply(rowToInsert, editID, rowAdding) {
    var cells = [];
    databaseData.data.Columns.forEach((column, index) => {
      let prop = databaseData.properties.find(property => column.Name === (property.fromColumn ?? property.name) && (rowToInsert[property.name] !== null));
      if (!rowAdding) {
        prop = databaseData.properties.find(property => column.Name === (property.fromColumn ?? property.name) && (databaseData.data.Rows[editID].Cells[cells.length] !== (property.lookupData ? rowToInsert[property.name + '_jsoriginal'] : rowToInsert[property.name])));
      }
      if (!prop) {
        prop = databaseData.properties.find(property => column.Name === (property.fromColumn ?? property.name) && rowToInsert.hasOwnProperty(property.name));
      }
      if (prop) {
        if (prop.lookupData) {
          return cells.push(rowToInsert[prop.name + '_jsoriginal'])
        }
        return cells.push(rowToInsert[prop.name])
      }
      else {
        let rowValue = (rowAdding ? rowToAdd.current : databaseData.data.Rows[rowToInsert['js_id']])?.Cells[index];
        if (column.NetType === 'System.DateTime' && rowValue) rowValue = toDate(rowValue);
        return cells.push(rowValue)
      }
    });
    const itemToInsert = {Id: null, Cells: cells};
    const dataJSON = JSON.stringify([itemToInsert]);
    if (rowAdding) {
      await sessionManager.channelsManager.insertRow(databaseData.tableId, dataJSON);
    } else {
      await sessionManager.channelsManager.updateRow(databaseData.tableId, editID, [itemToInsert]);
    }
  }

  async function getRow() {
    const result = await sessionManager.channelsManager.getNewRow(databaseData.tableId);
    rowToAdd.current = result;
    return rowConverter(databaseData, tableData.columnsJSON, result, tableData.rowsJSON.length);
  }

  const viewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    excelExport: () => { viewRef.current.excelExport(); },
    selectAll: () => { viewRef.current.selectAll(); },
    activeCell: () => viewRef.current.activeCell(),
    properties: () => databaseData?.properties,
    tableId: () => databaseData?.tableId,
    reload: reload,
  }));

  return (
    <div className={'grid-container'}>
      <DataSetView
        inputTableData={tableData}
        activeChannelName={activeChannelName}
        editable={databaseData?.data?.Editable}
        dataPart={databaseData?.data?.DataPart}
        formData={formData}
        apply={apply}
        deleteRows={deleteRows}
        getRow={getRow}
        reload={reload}
        ref={viewRef}
      />
    </div>
  );
}
export default DataSet = React.forwardRef(DataSet); // eslint-disable-line
