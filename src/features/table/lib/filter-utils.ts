import type { TableColumnModel } from './types';
import type { TableColumnFilter, TableColumnFilterState, CommonColumnFilterState } from './filter.types';
import Ajv from 'ajv';
import { stringifyLocalDate } from 'shared/lib';
import { numberFilterOptions, stringFilterOptions, dateFilterOptions, savedFilterSchema } from './constants';


export function createColumnFilter(type: TableColumnType): TableColumnFilter {
  const state = getDefaultFilterState(type);
  return {state, node: null, enabled: true};
}

export function getDefaultFilterState(type: TableColumnType): TableColumnFilterState {
  if (type === 'bool') {
    return {value: undefined};
  } else if (type === 'list' || type === 'tree') {
    return {values: new Set()};
  } else {
    const value = type === 'text' || type === 'color' ? '' : undefined;
    return {type1: 'eq', value1: value, type2: 'eq', value2: value, operator: 'and'};
  }
}

export function buildFilterNode(column: TableColumnModel): FilterNode {
  const type = column.type;
  const columnName = column.columnName;

  if (type === 'list' || type === 'tree') {
    const values = (column.filter.state as TableColumnFilterState<'list'>).values;
    if (!values || values.size === 0) return null;
    const nodeValue: FilterNode[] = [...values].map(v => ({type: 'eq', value: v}));
    return {column: columnName, type: 'or', value: nodeValue};
  }
  if (type === 'bool') {
    const value = (column.filter.state as TableColumnFilterState<'bool'>).value;
    if (value === undefined) return null;
    return {column: columnName, type: 'eq', value};
  }

  const state = column.filter.state as CommonColumnFilterState<any>;
  let { type1, value1, type2, value2, operator } = state;

  if (type === 'date') {
    if (value1) value1 = stringifyLocalDate(value1);
    if (value2) value2 = stringifyLocalDate(value2);
  }
  const hasValue1 = value1 !== undefined && value1 !== '';
  const hasValue2 = value2 !== undefined && value2 !== '';

  if (hasValue1 && hasValue2) {
    const nodeValue = [{type: type1, value: value1}, {type: type2, value: value2}];
    return {column: columnName, type: operator, value: nodeValue};
  } else if (hasValue1) {
    return {column: columnName, type: type1, value: value1};
  } else if (hasValue2) {
    return {column: columnName, type: type2, value: value2};
  }
  return null;
}

export function filterToString(node: FilterNode, type: TableColumnType, dict: LookupDict): any[] {
  type Token = string | {type: string, value: any};
  let tokens: Token[] = [];

  if (dict) {
    for (const { value } of node.value as IFilterNode<any, any>[]) {
      const tokenValue = dict[value] ?? value;
      tokens.push({type: 'value', value: tokenValue}, ', ');
    }
    tokens.pop();
  }
  else if (type === 'bool') {
    const text = node.value ? 'истинно' : 'ложно';
    tokens.push({type: 'value', value: text});
  }
  else if (Array.isArray(node.value)) {
    const [node1, node2] = node.value;
    const token = node.type === 'or' ? ' или ' : ' и ';
    return [...filterLeafToString(node1, type), token, ...filterLeafToString(node2, type)];
  } else {
    return filterLeafToString(node, type);
  }
  return tokens;
}

function filterLeafToString(leaf: FilterNode, type: TableColumnType): any[] {
  if (type === 'int' || type === 'real') {
    const option = numberFilterOptions.find(o => o.value === leaf.type);
    return [option.title.toLowerCase() + ' ', {type: 'number', value: leaf.value}];
  }
  if (type === 'text' || type === 'color') {
    const { label, title } = stringFilterOptions.find(o => o.value === leaf.type);
    const value = '«' + leaf.value + '»';
    return [(label ?? title).toLowerCase() + ' ', {type: 'string', value}];
  }
  if (type === 'date') {
    const option = dateFilterOptions.find(o => o.value === leaf.type);
    const value = new Date(leaf.value as string).toLocaleDateString();
    return [option.title.toLowerCase() + ' ', {type: 'value', value}];
  }
  return [];
}

/* --- --- */

type PayloadItem = TableColumnFilter & {id: PropertyName, type: TableColumnType, state: any};

export function serializeFilters(columns: TableColumnModel[]): Blob {
  const payload: PayloadItem[] = [];

  for (const column of columns) {
    if (!column.filter.node) continue;
    const item: PayloadItem = {id: column.id, type: column.type, ...column.filter};
    if (item.state.values) item.state.values = [...item.state.values];
    payload.push(item);
  }
  return new Blob([JSON.stringify(payload)]);
}

export function applyFilters(fileContent: string, columns: TableColumnModel[]): boolean {
  let payload: PayloadItem[];
  try {
    payload = JSON.parse(fileContent);
  } catch {
    return false;
  }

  const validator = new Ajv();
  const valid = validator.validate(savedFilterSchema, payload);
  if (!valid) return false;

  for (const column of columns) {
    const { id, type, filter } = column;
    const item = payload.find(i => i.id === id);

    if (item && item.type === type) {
      const { state, node, enabled } = item;
      if (state.values) state.values = new Set(state.values);

      if (type === 'date') {
        if (state.value1) state.value1 = new Date(state.value1);
        if (state.value2) state.value2 = new Date(state.value2);
      }
      filter.state = state;
      filter.node = node;
      filter.enabled = enabled;
    } else {
      column.filter = createColumnFilter(type);
    }
  }
  return true;
}
