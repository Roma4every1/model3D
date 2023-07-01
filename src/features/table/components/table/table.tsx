import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects, compareArrays } from 'shared/lib';
import { channelSelector, channelDictSelector } from 'entities/channels';
import { tableStateSelector, headerSetterParamsSelector } from '../../store/table.selectors';
import { resetTable, setTableColumnTree } from '../../store/table.actions';
import { getColumnModel } from '../../lib/column-tree';
import { applyColumnsHeaders } from '../../lib/column-tree-actions';
import { createRecords, applyLookupData } from '../../lib/records';
import { TableGrid } from './table-grid';
import './table.scss';


/** Редактируемая таблица. */
export const Table = ({id}: FormState) => {
  const dispatch = useDispatch();
  const [records, setRecords] = useState<TableRecord[]>([]);

  const state: TableState = useSelector(tableStateSelector.bind(id));
  const { channelName, headerSetterRules: rules, columns: columnsState, columnTree } = state;

  const channel: Channel = useSelector(channelSelector.bind(channelName)) ?? {} as any;
  const { data: channelData, query } = channel;

  const lookups = channel.info?.lookupChannels ?? [];
  const lookupData: ChannelDict = useSelector(channelDictSelector.bind(lookups), compareObjects);

  const paramsSelector = headerSetterParamsSelector.bind(rules);
  const headerSetterParams: Parameter[] = useSelector(paramsSelector, compareArrays);

  // Обновление заголовков колонок
  useEffect(() => {
    if (rules.length === 0) return;
    applyColumnsHeaders(columnTree, rules, headerSetterParams);
    dispatch(setTableColumnTree(id, [...columnTree]));
  }, [headerSetterParams, rules, id]); // eslint-disable-line

  // Обновление данных справочников
  useEffect(() => {
    applyLookupData(lookupData, columnsState);
  }, [lookupData]); // eslint-disable-line

  // Обновление записей таблицы и состояния при обновлении данных канала
  useEffect(() => {
    dispatch(resetTable(id, channel.tableID, channelData));
    const newRecords = createRecords(channelData, columnsState);
    setRecords(newRecords);
  }, [channelData]); // eslint-disable-line

  const columnModel = useMemo(() => {
    return getColumnModel(columnsState, columnTree, channelName, query);
  }, [columnsState, columnTree, channelName, query]);

  if (!channelName || !columnModel.length) return <div/>;
  return (
    <TableGrid id={id} state={state} query={query} records={records} setRecords={setRecords}>
      {columnModel}
    </TableGrid>
  );
};
