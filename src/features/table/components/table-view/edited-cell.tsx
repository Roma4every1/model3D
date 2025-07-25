import type { FC } from 'react';
import type { CellEditorProps } from '../../lib/types';
import { clsx } from 'clsx';
import { InputCellEditor } from './edited-cell-text';
import { BoolCellEditor, ColorCellEditor } from './edited-cell-primitive';
import { DateCellEditor, DateTimeCellEditor } from './edited-cell-date';
import { EditCellList, EditCellTree } from './edited-cell-lookup';


const cellEditorDict: Record<TableColumnType, FC<CellEditorProps>> = {
  'bool': BoolCellEditor,
  'int' : InputCellEditor,
  'real': InputCellEditor,
  'text': InputCellEditor,
  'date': DateCellEditor,
  'datetime': DateTimeCellEditor,
  'list': EditCellList,
  'tree': EditCellTree,
  'color': ColorCellEditor,
};

export const EditedCell = ({state, column, record}: Omit<CellEditorProps, 'update'>) => {
  const { type, fixed, cellStyle } = column;
  const update = (v: any) => state.data.setCellValue(record.index, column.id, v);

  const className = clsx(fixed && 'cell-sticky', 'cell-active', 'cell-edited');
  const style = fixed ? {left: cellStyle.left, borderRight: cellStyle.borderRight} : undefined;
  const Editor = cellEditorDict[type ?? 'text'];

  return (
    <td className={className} style={style}>
      <Editor state={state} column={column} record={record} update={update}/>
    </td>
  );
};
