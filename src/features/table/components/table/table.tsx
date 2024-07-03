import { useState, useEffect, useMemo } from 'react';
import { useChannel, useChannelDict } from 'entities/channel';
import { useParameterValues } from 'entities/parameter';
import { useTableState } from '../../store/table.store';
import { resetTable, setTableColumnTree } from '../../store/table.actions';
import { getColumnModel } from '../../lib/column-tree';
import { applyColumnsHeaders } from '../../lib/column-tree-actions';
import { TableGrid } from './table-grid';
import './table.scss';


/** Редактируемая таблица. */
export const Table = ({id}: Pick<SessionClient, 'id'>) => {
  const [records, setRecords] = useState<TableRecord[]>([]);
  const state = useTableState(id);
  const { recordHandler, channelName, headerSetterRules, columns, columnTree } = state;
  const headerSetterValues = useParameterValues(headerSetterRules.map(r => r.id));

  const channel: Channel = useChannel(channelName) ?? {} as any;
  const lookupData = useChannelDict(channel.config?.lookupChannels ?? []);
  const { data: channelData, query } = channel;

  // Обновление заголовков колонок
  useEffect(() => {
    if (headerSetterRules.length === 0) return;
    applyColumnsHeaders(columnTree, headerSetterRules, headerSetterValues);
    setTableColumnTree(id, [...columnTree]);
  }, [headerSetterValues, headerSetterRules, id]); // eslint-disable-line

  // Обновление данных справочников
  useEffect(() => {
    recordHandler.setLookupData(lookupData);
  }, [lookupData]); // eslint-disable-line

  // Обновление записей таблицы и состояния при обновлении данных канала
  useEffect(() => {
    resetTable(id, channelData);
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
