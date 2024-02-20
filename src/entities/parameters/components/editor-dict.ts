import { FunctionComponent } from 'react';
import { BoolEditor } from './bool.editor';
import { DateIntervalEditor } from './date-interval.editor';
import { DateEditor } from './date.editor';
import { FileEditor } from './file.editor';
import { IntegerEditor } from './integer.editor';
import { StringComboEditor } from './string.combo-editor';
import { StringEditor } from './string.editor';
import { TableCellComboEditor } from './table-cell.combo-editor';
import { TableRowComboEditor } from './table-row.combo-editor';


export interface EditorProps<P extends Parameter = Parameter> {
  parameter: P;
  channel?: Channel;
  update: (value: P['value']) => void;
}


/** Словарь для выбора редактора по типу; используется в компоненте `BaseEditor`. */
const editorDict: Record<string, FunctionComponent<EditorProps>> = {
  boolTextEditor: BoolEditor,
  dateIntervalTextEditor: DateIntervalEditor,
  dateKMNEditor: DateEditor,
  dateTextEditor: DateEditor,
  fileTextEditor: FileEditor,
  integerTextEditor: IntegerEditor,
  stringComboEditor: StringComboEditor,
  stringTextEditor: StringEditor,
  tableCellComboEditor: TableCellComboEditor,
  tableRowComboEditor: TableRowComboEditor,
  tableRowComboListEditor: TableRowComboEditor,
  tableRowTreeMultiEditor: TableRowComboEditor,
};

export function handleParameterList(list: Parameter[]): void {
  for (const parameter of list) {
    if (!parameter.editorType) { parameter.editor = null; continue; }
    parameter.editor = editorDict[parameter.editorType] ?? StringEditor;
    if (!parameter.nullDisplayValue) parameter.nullDisplayValue = 'Нет значения';
  }
  list.sort(parameterCompareFn);
}

function parameterCompareFn(a: Parameter, b: Parameter): number {
  if (a.editorDisplayOrder === null) return 1;
  if (b.editorDisplayOrder === null) return -1;
  return a.editorDisplayOrder - b.editorDisplayOrder;
}
