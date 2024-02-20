import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects, compareArrays } from 'shared/lib';
import { channelSelector, channelDictSelector } from 'entities/channels';
import { tableStateSelector, headerSetterParamsSelector } from '../../store/table.selectors';
import { resetTable, setTableColumnTree } from '../../store/table.actions';
import { getColumnModel } from '../../lib/column-tree';
import { applyColumnsHeaders } from '../../lib/column-tree-actions';
import { TableGrid } from './table-grid';
import './table.scss';


/** Редактируемая таблица. */
export const Table = ({id}: FormState) => {
  const dispatch = useDispatch();
  const [records, setRecords] = useState<TableRecord[]>([]);

  const state: TableState = useSelector(tableStateSelector.bind(id));
  const { recordHandler, channelName, headerSetterRules, columns, columnTree } = state;

  const channel: Channel = useSelector(channelSelector.bind(channelName)) ?? {} as any;
  const { data: channelData, query } = channel;

  const lookups = channel.info?.lookupChannels ?? [];
  const lookupData: ChannelDict = useSelector(channelDictSelector.bind(lookups), compareObjects);

  const paramsSelector = headerSetterParamsSelector.bind(headerSetterRules);
  const headerSetterParams: Parameter[] = useSelector(paramsSelector, compareArrays);

  // Обновление заголовков колонок
  useEffect(() => {
    if (headerSetterRules.length === 0) return;
    applyColumnsHeaders(columnTree, headerSetterRules, headerSetterParams);
    dispatch(setTableColumnTree(id, [...columnTree]));
  }, [headerSetterParams, headerSetterRules, id]); // eslint-disable-line

  // Обновление данных справочников
  useEffect(() => {
    recordHandler.setLookupData(lookupData);
  }, [lookupData]); // eslint-disable-line

  // Обновление записей таблицы и состояния при обновлении данных канала
  useEffect(() => {
    dispatch(resetTable(id, channel.tableID, channelData));
    setRecords(recordHandler.createRecords(channelData));
  }, [channelData]); // eslint-disable-line

  const columnModel = useMemo(() => {
    return getColumnModel(columns, columnTree, channelName, query);
  }, [columns, columnTree, channelName, query]);

  if (!channelName || !columnModel.length) return <div/>;
  return (
    <TableGrid id={id} state={state} query={query} records={records} setRecords={setRecords}>
      {columnModel}
    </TableGrid>
  );
};
