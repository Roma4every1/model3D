import { FunctionComponent } from "react";

import BoolTextEditor from "../components/editors/bool-text.editor";
import DateIntervalTextEditor from "../components/editors/date-interval-text.editor";
import DateTextEditor from "../components/editors/date-text.editor";
import FilesTextEditor from "../components/editors/files-text.editor";
import FileTextEditor from "../components/editors/file-text.editor";
import IntegerTextEditor from "../components/editors/integer-text.editor";
import StringComboEditor from "../components/editors/string-combo.editor";
import StringTextEditor from "../components/editors/string-text.editor";
import TableCellComboEditor from "../components/editors/table-cell-combo.editor";
import TableRowComboEditor from "../components/editors/table-row-combo.editor";


/** Словарь для выбора редактора по типу; используется в компоненте `BaseEditor`. */
export const editorsDict: {[key: string]: FunctionComponent} = {
  boolTextEditor: BoolTextEditor,
  dateIntervalTextEditor: DateIntervalTextEditor,
  dateKMNEditor: DateTextEditor,
  dateTextEditor: DateTextEditor,
  fileTextEditor: FileTextEditor,
  filesTextEditor: FilesTextEditor,
  integerTextEditor: IntegerTextEditor,
  stringComboEditor: StringComboEditor,
  stringTextEditor: StringTextEditor,
  tableCellComboEditor: TableCellComboEditor,
  tableRowComboEditor: TableRowComboEditor,
  tableRowComboListEditor: TableRowComboEditor,
  tableRowTreeMultiEditor: TableRowComboEditor,
}
