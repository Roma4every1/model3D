import type { ButtonSwitchProps } from 'shared/ui';
import type { ColumnFilterOption } from './filter.types';


/** Шрифт ячеек таблицы. */
export const cellFont = '12.5px Roboto';

/** Стандартный размер скроллера HTML элемента в пикселях. */
export const scrollWidth = 15;

/** Стандартная высота строки таблицы в пикселях. */
export const rowHeight = 24;
/** Минимально допустимая ширина ячейки таблицы. */
export const minCellWidth = 40;
/** Максимально допустимая ширина ячейки таблицы. */
export const maxCellWidth = 400;

/** Варианты комбинации фильтров */
export const filterOperators: ButtonSwitchProps<string>['options'] = [
  {label: 'и', value: 'and'},
  {label: 'или', value: 'or'},
];

/** Доступные виды фильтрации для численной колонки. */
export const numberFilterOptions: ColumnFilterOption[] = [
  {value: 'eq', label: '=', title: 'Равно'},
  {value: 'neq', label: '≠', title: 'Не равно'},
  {value: 'gt', label: '>', title: 'Больше'},
  {value: 'gte', label: '≥', title: 'Больше либо равно'},
  {value: 'lt', label: '<', title: 'Меньше'},
  {value: 'lte', label: '≤', title: 'Меньше либо равно'},
  {value: 'null', label: 'Не задано'},
];

/** Доступные виды фильтрации для текстовой колонки. */
export const stringFilterOptions: ColumnFilterOption[] = [
  {value: 'eq', label: 'Равно'},
  {value: 'neq', label: 'Не равно'},
  {value: 'contains', label: 'Содержит'},
  {value: 'starts', label: 'Начинается', title: 'Начинается на'},
  {value: 'ends', label: 'Заканчивается', title: 'Заканчивается на'},
  {value: 'null', label: 'Не задано'},
];

/** Доступные виды фильтрации для колонки, визуализирующей цвет. */
export const colorFilterOptions: ColumnFilterOption[] = [
  {value: 'eq', label: 'Равно'},
  {value: 'neq', label: 'Не равно'},
  {value: 'null', label: 'Не задано'},
];

/** Доступные виды фильтрации для колонки с датой. */
export const dateFilterOptions: ColumnFilterOption[] = [
  {value: 'eq', label: '=', title: 'Соответствует'},
  {value: 'neq', label: '≠', title: 'Не соответствует'},
  {value: 'gt', label: '>', title: 'Позднее чем'},
  {value: 'gte', label: '≥', title: 'Не ранее чем'},
  {value: 'lt', label: '<', title: 'Ранее чем'},
  {value: 'lte', label: '≤', title: 'Не позднее чем'},
  {value: 'null', label: 'Не задано'},
];

/* --- Filter JSON Schema --- */

const filterNodeSchema = {
  type: 'object',
  properties: {
    type: {type: 'string'},
    column: {type: 'string'},
    value: true,
  },
  required: ['type', 'value'],
  additionalProperties: false,
};

const columnTypes = ['bool', 'int', 'real', 'text', 'date', 'list', 'tree', 'color'];

/**
 * Схема валидации, которая используется при загрузке фильтров из файла.
 * Примечание: схема узла фильтра неполная.
 *
 * Структура соответствует спефицикации JSON Schema, Draft 7.
 * @see https://json-schema.org/specification-links
 */
export const savedFilterSchema: any = {
  type: 'array',
  items: {anyOf: columnTypes.map(createFilterSchema)},
};

function createFilterSchema(type: TableColumnType) {
  return {
    type: 'object',
    properties: {
      id: {type: 'string'},
      type: {enum: [type]},
      state: createStateSchema(type),
      node: {anyOf: [{type: 'null'}, filterNodeSchema]},
      enabled: {type: 'boolean'},
      uniqueValues: {type: 'array'},
    },
    required: ['id', 'type', 'state', 'node', 'enabled'],
    additionalProperties: false,
  }
}
function createStateSchema(type: TableColumnType): any {
  if (type === 'int' || type === 'real') {
    return createCommonFilterStateSchema({type: 'number'});
  }
  if (type === 'date' || type === 'text' || type === 'color') {
    return createCommonFilterStateSchema({type: 'string'});
  }
  const properties = type === 'bool'
    ? {value: {type: 'boolean'}, nullable: {type: 'boolean'}}
    : {values: {type: 'array'}};
  return {type: 'object', properties, additionalProperties: false};
}
function createCommonFilterStateSchema(valueSchema: any): any {
  return {
    type: 'object',
    properties: {
      type1: {type: 'string'},
      value1: valueSchema,
      type2: {type: 'string'},
      value2: valueSchema,
      operator: {enum: ['or', 'and']},
    },
    required: ['type1', 'type2', 'operator'],
    additionalProperties: false,
  };
}
