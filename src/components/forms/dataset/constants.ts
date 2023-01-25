import { GridFilterOperators } from '@progress/kendo-react-grid';


export const filterOperators: GridFilterOperators = {
  'text': [
    {text: 'grid.filterContainsOperator', operator: 'contains'},
    {text: 'grid.filterEqOperator', operator: 'eq'},
    {text: 'grid.filterNotEqOperator', operator: 'neq'},
    {text: 'grid.filterStartsWithOperator', operator: 'startswith'},
    {text: 'grid.filterEndsWithOperator', operator: 'endswith'},
    {text: 'grid.filterIsNullOperator', operator: 'isnull'},
    {text: 'grid.filterIsNotNullOperator', operator: 'isnotnull'},
  ],
  'numeric': [
    {text: 'grid.filterEqOperator', operator: 'eq'},
    {text: 'grid.filterNotEqOperator', operator: 'neq'},
    {text: 'grid.filterGtOperator', operator: 'gt'},
    {text: 'grid.filterLtOperator', operator: 'lt'},
    {text: 'grid.filterGteOperator', operator: 'gte'},
    {text: 'grid.filterLteOperator', operator: 'lte'},
    {text: 'grid.filterIsNullOperator', operator: 'isnull'},
    {text: 'grid.filterIsNotNullOperator', operator: 'isnotnull'},
  ],
  'date': [
    {text: 'grid.filterEqOperator', operator: 'eq'},
    {text: 'grid.filterNotEqOperator', operator: 'neq'},
    {text: 'grid.filterAfterOperator', operator: 'gt'},
    {text: 'grid.filterBeforeOperator', operator: 'lt'},
    {text: 'grid.filterAfterOrEqualOperator', operator: 'gte'},
    {text: 'grid.filterBeforeOrEqualOperator', operator: 'lte'},
    {text: 'grid.filterIsNullOperator', operator: 'isnull'},
    {text: 'grid.filterIsNotNullOperator', operator: 'isnotnull'}
  ],
  'boolean': [
    {text: 'grid.filterEqOperator', operator: 'eq'},
  ],
};

export const filterOperations: Record<string, string> = {
  'eq': 'equal',
  'gt': 'greater',
  'lt': 'less',
  'gte': 'greaterAndEqual',
  'lte': 'lessAndEqual',
  'neq': 'notEqual',
  'isnull': 'isNull',
  'isnullempty': 'isNull',
  'isnotnull': 'isNotNull',
  'isnotempty': 'isNotNull',
  'contains': 'contains',
  'doesnotcontains': 'notContains',
  'startswith': 'startsWith',
  'endswith': 'endsWith'
};
