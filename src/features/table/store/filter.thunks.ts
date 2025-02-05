import { t } from 'shared/locales';
import { saveAs } from '@progress/kendo-file-saver';
import { showWarningMessage } from 'entities/window';
import { showNotification } from 'entities/notification';
import { useClientStore, setClientLoading } from 'entities/client';
import { useParameterStore, findParameters } from 'entities/parameter';
import { useChannelStore, channelAPI, reloadChannel } from 'entities/channel';
import { useTableStore } from './table.store';
import { applyFilters, createColumnFilter, serializeFilters } from '../lib/filter-utils';
import { getTableDisplayName } from './table.thunks';


export async function updateTableFilters(id: FormID, saveValuesFor?: PropertyName): Promise<void> {
  const state = useTableStore.getState()[id];
  const columnFilters: FilterNode[] = [];

  if (state.globalSettings.filterEnabled) {
    for (const column of state.columns.list) {
      const filter = column.filter;
      if (filter?.node && filter.enabled) columnFilters.push(filter.node);
    }
  }
  let newFilter: FilterNode;

  if (columnFilters.length > 1) {
    newFilter = {type: 'and', value: columnFilters};
  } else if (columnFilters.length > 0) {
    newFilter = columnFilters[0]
  }
  const channel = useChannelStore.getState().storage[state.channelID];
  const oldFilter = channel.query.filter;
  channel.query.filter = newFilter;

  useTableStore.setState({[id]: {...state}});
  if (oldFilter === newFilter) return;

  setClientLoading(id, 'data');
  const savedColumn = saveValuesFor && state.columns.dict[saveValuesFor];
  let savedUniqueValues = savedColumn?.filter?.uniqueValues;
  syncTableFilters(id);
  await reloadChannel(channel.id);
  if (savedUniqueValues) savedColumn.filter.uniqueValues = savedUniqueValues;
  setClientLoading(id, 'done');
}

/**
 * При изменении состояния фильтра канала, все зависящие от него таблицы
 * (в рамках данной презентации) должны обновить состояние.
 */
function syncTableFilters(id: FormID): void {
  const tables = useTableStore.getState();
  const clients = useClientStore.getState();

  const ids: FormID[] = [];
  const channel = useChannelStore.getState().storage[tables[id].channelID];

  clients[clients[id].parent].children.forEach((child: FormDataWM) => {
    const channelID = tables[child.id]?.channelID;
    if (channelID === channel.id && child.id !== id) ids.push(child.id);
  });
  if (ids.length === 0) return;

  const updates = {};
  const rootNode = channel.query.filter;
  const filters = rootNode && (rootNode.column ? [rootNode] : rootNode.value as FilterNode[]);

  for (const formID of ids) {
    const state = tables[formID];
    if (rootNode) {
      for (const column of state.columns.list) {
        let { filter, columnName } = column;
        const node = filters.find(f => f.column === columnName);

        if (node) {
          if (!filter) {
            filter = createColumnFilter(column.type);
            column.filter = filter;
          }
          filter.node = node;
          filter.enabled = true;
        } else if (filter) {
          filter.node = null;
        }
      }
      state.globalSettings.filterEnabled = true;
    } else {
      for (const { filter } of state.columns.list) {
        if (filter) filter.node = null;
      }
    }
    updates[formID] = {...state};
  }
  useTableStore.setState(updates);
}

/* --- --- */

export async function applyUploadedFilters(id: FormID, file: File): Promise<void> {
  const warn = (m: string) => showWarningMessage(t(m), t('table.filter.upload-title'));
  const fileContent = await file.text().catch(() => null);
  if (fileContent === null) return warn('table.filter.error-decoding');

  const state = useTableStore.getState()[id];
  const ok = applyFilters(fileContent, state.columns.list);
  if (!ok) return warn('table.filter.error-format');

  state.globalSettings.filterEnabled = true;
  await updateTableFilters(id);
  showNotification({type: 'success', content: t('table.filter.applied')});
}

export function saveTableFilters(id: FormID): void {
  const state = useTableStore.getState()[id];
  const data = serializeFilters(state.columns.list);
  const fileName = getTableDisplayName(id)?.replace(/\s/g, '_');
  saveAs(data, (fileName || 'filters') + '.json');
}

/* --- --- */

export async function applyFilterUniqueValues(id: FormID, col: PropertyName): Promise<void> {
  const state = useTableStore.getState()[id];
  const filter = state.columns.dict[col].filter;
  if (!filter) return;

  if (filter.node) {
    const values = await fetchFilterUniqueValues(id, col);
    filter.uniqueValues = values ?? [];
  } else {
    filter.uniqueValues = state.data.getUniqueValues(col);
  }
}

/**
 * Запрашивает уникальные значения для фильтра. Значения получаются на основе датасета,
 * который был бы при отсутсвии фильтра в данной колонке.
 */
async function fetchFilterUniqueValues(id: FormID, col: PropertyName): Promise<any[]> {
  const state = useTableStore.getState()[id];
  const channelStorage = useChannelStore.getState().storage;
  const parameterStorage = useParameterStore.getState().storage;

  const channel = channelStorage[state.channelID];
  const columnName = state.columns.dict[col].columnName;

  let filter: FilterNode = null;
  const originFilter = channel.query.filter;

  if (originFilter && originFilter.type === 'and') {
    const newValue = originFilter.value.filter(node => node.column !== columnName);
    filter = {type: originFilter.type, value: newValue};
  }
  const parameters = findParameters(channel.config.parameters, parameterStorage);
  const query: ChannelQuerySettings = {filter, limit: channel.query.limit};
  return channelAPI.getColumnUniqueValues(channel.name, columnName, parameters, query);
}
