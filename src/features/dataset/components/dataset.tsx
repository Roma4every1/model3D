import { forwardRef, useRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataSetView } from './dataset-view';
import { channelsAPI } from '../../../entities/channels/lib/channels.api';
import { channelSelector, reloadChannel } from '../../../entities/channels';
import { convertRow, channelPropertyToColumn } from '../lib/dataset-utils';


function _DataSet({formData, channels}, ref) {
  const dispatch = useDispatch();

  const channelName = channels[0];
  const databaseData: Channel = useSelector(channelSelector.bind(channelName));

  let columnsJSON = [];
  let rowsJSON = [];

  if (databaseData && databaseData.data && databaseData.info.properties) {
    columnsJSON = databaseData.info.properties.map(channelPropertyToColumn, databaseData.data.columns);
    rowsJSON = databaseData.data.rows.map((row, rowIndex) => {
      return convertRow(databaseData, columnsJSON, row, rowIndex)
    });
  }

  const getRow = async () => {
    const { ok, data } = await channelsAPI.getNewRow(databaseData.tableID);
    if (!ok || !data) return null;
    return convertRow(databaseData, columnsJSON, data, rowsJSON.length);
  };
  const reload = () => dispatch(reloadChannel(channelName));

  const viewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    excelExport: () => { viewRef.current.excelExport(); },
    selectAll: () => { viewRef.current.selectAll(); },
    activeCell: () => viewRef.current.activeCell(),
    properties: () => databaseData?.info.properties,
    tableId: () => databaseData?.tableID,
    reload: reload,
  }));

  const tableData = {
    rowsJSON, columnsJSON, databaseData,
    properties: databaseData?.info.properties,
    currentRowObjectName: databaseData?.info.currentRowObjectName
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
export const DataSet = forwardRef(_DataSet);
