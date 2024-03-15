import { FunctionComponent } from 'react';
import { BoolEditor } from './bool-editor.tsx';
import { DateIntervalEditor } from './date-interval-editor.tsx';
import { DateEditor } from './date-editor.tsx';
import { FileEditor } from './file.editor';
import { IntegerEditor } from './integer-editor.tsx';
import { StringEditor } from './string-editor.tsx';
import { TableRowListEditor } from './table-row-list-editor.tsx';
import { TableRowTreeEditor } from './table-row-tree-editor.tsx';


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
  stringComboEditor: TableRowListEditor,
  stringTextEditor: StringEditor,
  tableCellComboEditor: TableRowListEditor,
  tableRowComboEditor: TableRowListEditor,
  tableRowComboListEditor: TableRowListEditor,
  tableRowTreeMultiEditor: TableRowListEditor,
};

export function getEditor(parameter: Parameter, channel?: Channel): FunctionComponent<EditorProps> {
  if (!parameter.editorType) return null;
  let editor = editorDict[parameter.editorType] ?? StringEditor;

  if (channel && parameter.type === 'tableRow' && editor === TableRowListEditor) {
    if (channel.info.lookupColumns.parent.index >= 0) editor = TableRowTreeEditor;
  }
  return editor;
}
