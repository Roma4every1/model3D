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

export function handleParameterList(list: Parameter[], channels: ChannelDict): void {
  for (const parameter of list) {
    if (!parameter.editorType) { parameter.editor = null; continue; }
    parameter.editor = editorDict[parameter.editorType] ?? StringEditor;
    if (!parameter.nullDisplayValue) parameter.nullDisplayValue = 'Нет значения';

    if (parameter.type === 'tableRow' && parameter.editor === TableRowListEditor) {
      const channel = channels[parameter.externalChannelName];
      if (channel && channel.info.properties.some(p => p.name === 'LOOKUPPARENTCODE')) {
        parameter.editor = TableRowTreeEditor;
      }
    }
  }
  list.sort(parameterCompareFn);
}

function parameterCompareFn(a: Parameter, b: Parameter): number {
  if (a.editorDisplayOrder === null) return 1;
  if (b.editorDisplayOrder === null) return -1;
  return a.editorDisplayOrder - b.editorDisplayOrder;
}
