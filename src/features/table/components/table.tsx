import { useEffect } from 'react';
import { useChannel, useChannelDict, useChannelLoading } from 'entities/channel';
import { useParameterValues } from 'entities/parameter';
import { useTableState } from '../store/table.store';
import { setTableChannelData, setTableLookupData, setTableHeaderValues } from '../store/table.actions';
import { TableRoot } from './table-view/table-root';
import { OneRecordView } from './record-mode/one-record-view';


export const Table = ({id, neededChannels}: Pick<SessionClient, 'id' | 'neededChannels'>) => {
  const state = useTableState(id);
  const headerSetterValues = useParameterValues(state.columns.headerParameterIDs);

  const channel = useChannel(state.channelID);
  const lookupData = useChannelDict(state.lookupChannelIDs);
  const loading = useChannelLoading(neededChannels);

  const channelData = channel.data;
  const queryID = state.data.queryID;

  useEffect(() => {
    setTableLookupData(id, lookupData);
  }, [lookupData, id]);

  useEffect(() => {
    if (channelData?.queryID === queryID) return;
    setTableChannelData(id, channelData);
  }, [channelData, queryID, id]);

  useEffect(() => {
    setTableHeaderValues(id, headerSetterValues);
  }, [headerSetterValues, id]);

  if (state.globalSettings.tableMode) {
    return <TableRoot state={state} query={channel.query} loading={loading}/>;
  } else {
    return <OneRecordView state={state}/>;
  }
};
