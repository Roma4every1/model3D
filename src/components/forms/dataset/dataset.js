import React, { useRef, useImperativeHandle } from "react";
import { useSelector } from "react-redux";
import DataSetView from "./dataset-view";
import { selectors, sessionManager } from "../../../store";
import { convertRow, channelPropertyToColumn } from "./dataset-utils";


function DataSet({formData, channels}, ref) {
  const channelName = channels[0];
  /** @type Channel */
  const databaseData = useSelector(selectors.channel.bind(channelName));

  let columnsJSON = [];
  let rowsJSON = [];

  if (databaseData && databaseData.data && databaseData.properties) {
    columnsJSON = databaseData.properties.map(channelPropertyToColumn, databaseData.data.Columns);
    rowsJSON = databaseData.data.Rows.map((row, rowIndex) => {
      return convertRow(databaseData, columnsJSON, row, rowIndex)
    });
  }

  const getRow = async () => {
    const result = await sessionManager.channelsManager.getNewRow(databaseData.tableId);
    if (!result) return null;
    return convertRow(databaseData, columnsJSON, result, rowsJSON.length);
  };
  const reload = async () => {
    await sessionManager.channelsManager.loadAllChannelData(channelName, formData.id, true);
  };

  const viewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    excelExport: () => { viewRef.current.excelExport(); },
    selectAll: () => { viewRef.current.selectAll(); },
    activeCell: () => viewRef.current.activeCell(),
    properties: () => databaseData?.properties,
    tableId: () => databaseData?.tableId,
    reload: reload,
  }));

  const tableData = {
    rowsJSON, columnsJSON, databaseData,
    properties: databaseData?.properties,
    currentRowObjectName: databaseData?.currentRowObjectName
  };

  return (
    <div className={'grid-container'}>
      <DataSetView
        ref={viewRef} formData={formData}
        inputTableData={tableData} channelName={channelName}
        getRow={getRow} reload={reload}
      />
    </div>
  );
}
export default DataSet = React.forwardRef(DataSet); // eslint-disable-line
