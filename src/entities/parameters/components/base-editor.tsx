import { FunctionComponent, createElement } from 'react';
import { BoolEditor } from './bool.editor';
import { DateIntervalEditor } from './date-interval.editor';
import { DateEditor } from './date.editor';
import { FileEditor } from './file.editor';
import { IntegerEditor } from './integer.editor';
import { StringComboEditor } from './string.combo-editor';
import { StringEditor } from './string.editor';
import { TableCellComboEditor } from './table-cell.combo-editor';
import { TableRowComboEditor } from './table-row.combo-editor';


export interface EditorProps<Param extends Parameter = Parameter> {
  parameter: Param,
  channel?: Channel,
  update: (value: Param['value']) => void,
}


/** Словарь для выбора редактора по типу; используется в компоненте `BaseEditor`. */
const editorsDict: Record<string, FunctionComponent<EditorProps>> = {
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


export const BaseEditor = (props: EditorProps) => {
  const SpecificEditor = editorsDict[props.parameter.editorType] || StringEditor;

  return (
    <div className={'parameter'}>
      <span>{props.parameter.displayName}</span>
      {createElement<EditorProps>(SpecificEditor, props)}
    </div>
  );
};
