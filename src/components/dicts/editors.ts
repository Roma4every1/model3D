import { FunctionComponent } from "react";

import BoolTextEditor from "../editors/BoolTextEditor";
import DateIntervalTextEditor from "../editors/DateIntervalTextEditor";
import DateTextEditor from "../editors/DateTextEditor";
import FilesTextEditor from "../editors/FilesTextEditor";
import FileTextEditor from "../editors/FileTextEditor";
import IntegerTextEditor from "../editors/IntegerTextEditor";
import StringComboEditor from "../editors/StringComboEditor";
import StringTextEditor from "../editors/StringTextEditor";
import TableCellComboEditor from "../editors/TableCellComboEditor";
import TableRowComboEditor from "../editors/TableRowComboEditor";


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
