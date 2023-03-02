import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects } from 'shared/lib';
import { channelSelector, channelDictSelector } from 'entities/channels';
import { tableStateSelector } from '../../store/tables.selectors';
import { resetTable } from '../../store/tables.actions';
import { createRecords, applyLookupData } from '../../lib/records';
import { TableGrid } from './table-grid';
import './table.scss';


/** Редактируемая таблица. */
export const Table = ({id}: FormState) => {
  const dispatch = useDispatch();
  const [records, setRecords] = useState<TableRecord[]>([]);

  const state: TableState = useSelector(tableStateSelector.bind(id));
  const columnsState = state.columns;

  const channel: Channel = useSelector(channelSelector.bind(state.channelName));
  const channelData = channel.data;

  const lookups = channel.info.lookupChannels;
  const lookupData: ChannelDict = useSelector(channelDictSelector.bind(lookups), compareObjects);

  // Обновление данных справочников
  useEffect(() => {
    applyLookupData(lookupData, columnsState);
  }, [lookupData]); // eslint-disable-line

  // Обновление записей таблицы и состояния при обновлении данных канала
  useEffect(() => {
    if (!channelData.rows?.length) return;
    dispatch(resetTable(id, channel.tableID, channelData));
    const newRecords = createRecords(channelData, columnsState);
    setRecords(newRecords);
  }, [channelData]); // eslint-disable-line

  return <TableGrid id={id} state={state} records={records} setRecords={setRecords}/>;
};
