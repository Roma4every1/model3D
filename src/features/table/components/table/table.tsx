import { useState, useEffect, useMemo } from 'react';
import { useRender } from 'shared/react';
import { useChannel, useChannelDict } from 'entities/channel';
import { useParameterValues } from 'entities/parameter';
import { useTableState } from '../../store/table.store';
import { resetTable, setTableColumnTree } from '../../store/table.actions';
import { getColumnModel } from '../../lib/column-tree';
import { applyColumnsHeaders } from '../../lib/column-tree-actions';
import { TableGrid } from './table-grid';
import './table.scss';


/** Редактируемая таблица. */
export const Table = ({id, loading}: Pick<SessionClient, 'id' | 'loading'>) => {
  const render = useRender();
  const [records, setRecords] = useState<TableRecord[]>([]);
  const state = useTableState(id);
  const { recordHandler, channelID, lookupChannelIDs, headerSetterRules, columnTree } = state;
  const headerSetterValues = useParameterValues(headerSetterRules.map(r => r.id));

  const channel: Channel = useChannel(channelID) ?? {} as any;
  const lookupData = useChannelDict(lookupChannelIDs);
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
    render();
  }, [lookupData]); // eslint-disable-line

  // Обновление записей таблицы и состояния при обновлении данных канала
  useEffect(() => {
    resetTable(id, channelData);
    setRecords(recordHandler.createRecords(channelData));
  }, [channelData]); // eslint-disable-line

  const columnModel = useMemo(() => {
    return getColumnModel(state.columns, columnTree, channelID, query);
  }, [state.columns, columnTree, channelID, query]);

  if (!channelID || !columnModel.length) return <div/>;
  const isLoading = loading?.status === 'data';

  return (
    <TableGrid
      id={id} loading={isLoading} state={state} query={query}
      records={records} setRecords={setRecords}
    >
      {columnModel}
    </TableGrid>
  );
};
