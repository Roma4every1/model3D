import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects } from 'shared/lib';
import { channelSelector, channelDictSelector } from 'entities/channels';
import { tableStateSelector } from '../../store/tables.selectors';
import { resetTable } from '../../store/tables.actions';
import { getColumnModel } from '../../lib/column-tree';
import { createRecords, applyLookupData } from '../../lib/records';
import { TableGrid } from './table-grid';
import './table.scss';


/** Редактируемая таблица. */
export const Table = ({id}: FormState) => {
  const dispatch = useDispatch();
  const [records, setRecords] = useState<TableRecord[]>([]);

  const state: TableState = useSelector(tableStateSelector.bind(id));
  const { channelName, columns: columnsState, columnTree } = state;

  const channel: Channel = useSelector(channelSelector.bind(channelName));
  const { data: channelData, query } = channel;

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

  const columnModel = useMemo(() => {
    return getColumnModel(columnsState, columnTree, channelName, query);
  }, [columnsState, columnTree, channelName, query]);

  return (
    <TableGrid id={id} state={state} records={records} setRecords={setRecords}>
      {columnModel}
    </TableGrid>
  );
};
