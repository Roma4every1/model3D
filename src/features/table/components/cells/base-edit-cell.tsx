import { CellActions } from '../../lib/types';
import { FunctionComponent, createElement } from 'react';
import { EditCellMetadata, EditCellTextInput } from './edit-cell-text';
import { EditCellBool, EditCellDate } from './edit-cell-primitive';
import { EditCellList, EditCellTree } from './edit-cell-lookup';


export interface EditCellProps<Value = any> {
  column: TableColumnState,
  value: Value | null,
  actions: CellActions,
  update(value: Value | null): void,
}


const cellMetadataInt: EditCellMetadata = {
  regex: /^[-+]?\d+$/,
  parse: parseInt
};
const cellMetadataReal: EditCellMetadata = {
  regex: /^[+-]?((\d+([.,]\d*)?)|([.,]\d+))$/,
  parse: (str) => parseFloat(str.replace(',', '.')),
};

const cellsDict: Record<TableColumnType, FunctionComponent<EditCellProps>> = {
  'bool': EditCellBool,
  'int' : EditCellTextInput.bind(cellMetadataInt),
  'real': EditCellTextInput.bind(cellMetadataReal),
  'text': EditCellTextInput.bind({}),
  'date': EditCellDate,
  'list': EditCellList,
  'tree': EditCellTree,
};

export const BaseEditCell = (props: EditCellProps) => {
  return createElement(cellsDict[props.column.type], props);
};
