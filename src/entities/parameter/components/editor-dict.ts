import { FunctionComponent } from 'react';
import { BoolEditor } from './bool-editor';
import { DateIntervalEditor } from './date-interval-editor';
import { DateEditor } from './date-editor';
import { FileEditor } from './file-editor';
import { FilesEditor } from './files-editor';
import { IntegerArrayTreeEditor } from './integer-array-tree-editor';
import { IntegerEditor } from './integer-editor';
import { StringEditor } from './string-editor';
import { TextEditor } from './text-editor';
import { TableRowListEditor } from './table-row-list-editor';
import { TableRowTreeEditor } from './table-row-tree-editor';
import { DoubleIntervalEditor } from './double-interval-editor';


export interface EditorProps<T extends ParameterType = ParameterType> {
  parameter: Parameter<T>;
  channel?: Channel;
  update: (value: ParameterValueMap[T]) => void;
}

/** Словарь для выбора редактора по типу; используется в компоненте `BaseEditor`. */
const editorDict: Record<string, FunctionComponent<EditorProps>> = {
  boolTextEditor: BoolEditor,
  dateIntervalTextEditor: DateIntervalEditor,
  dateKMNEditor: DateEditor,
  dateTextEditor: DateEditor,
  doubleTextEditor: IntegerEditor,
  fileTextEditor: FileEditor,
  filesTextEditor: FilesEditor,
  integerTextEditor: IntegerEditor,
  integerArrayTreeEditor: IntegerArrayTreeEditor,
  stringComboEditor: TableRowListEditor,
  stringTextEditor: StringEditor,
  textareaEditor: TextEditor,
  tableCellComboEditor: TableRowListEditor,
  tableRowComboEditor: TableRowListEditor,
  tableRowComboListEditor: TableRowListEditor,
  tableRowTreeMultiEditor: TableRowListEditor,
  doubleIntervalTextEditor: DoubleIntervalEditor,
};

export function getEditor(parameter: Parameter, channel?: Channel): FunctionComponent<EditorProps> {
  let editor = editorDict[parameter.editor.type] ?? StringEditor;
  if (channel && parameter.type === 'tableRow' && editor === TableRowListEditor) {
    if (channel.config.lookupColumns.parent.columnIndex >= 0) editor = TableRowTreeEditor;
  }
  return editor;
}
