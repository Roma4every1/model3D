import { TFunction } from 'react-i18next';


/** Серверный формат настроек формы **DataSet**. */
export interface TableFormSettings {
  id: FormID;
  toolbar?: TableToolbarSettings;
  columnSettings?: DataSetColumnsSettings;
  headerSetterRules?: HeaderSetterRule[];
  exportToExcel?: true;
  stat?: true;
  selection?: true;
  columnVisibility?: true;
}

export interface DataSetColumnsSettings {
  columns?: DataSetColumnSettings[];
  columnGroups?: TableColumnGroupSettings[];
  rowStyleRules?: RowStyleRule[];
  tableMode?: boolean;
  alternate?: boolean;
  alternateBackground?: string;
  fixedColumnCount?: number;
}

export interface DataSetColumnSettings {
  property: string;
  displayName?: string;
  displayIndex?: number;
  width?: number;
  foreground?: string;
  background?: string;
  headerForeground?: string;
  headerBackground?: string;
  visible?: boolean;
  readOnly?: boolean;
  typeFormat?: string;
}

interface TableColumnGroupSettings {
  name: string;
  displayName?: string;
  headerForeground?: string;
  headerBackground?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface RowStyleRule {
  type: RowStyleConditionType;
  parameter?: string;
  property: string;
  foreground?: string;
  background?: string;
}
export type RowStyleConditionType = 'equal' | 'not_empty';

export type DataSetColumnDict = Record<TableColumnID, DataSetColumnSettings>;

/* --- Actions --- */

/** Сеттер из useState для {@link TableRecord}[]. */
export type SetRecords = (value: TableRecord[] | ((prev: TableRecord[]) => TableRecord[])) => void;

/** Объект с функциями-контролами состояния для рендера тулбара. */
export interface ToolbarActions {
  acceptEdit(): void;
  cancelEdit(): void;
  addRecord(copy: boolean): void;
  deleteRecords(): void;
  toStart(): void;
  toEnd(): void;
  moveCellVertical(by: number): void;
}

/** Объект с функциями-контролами состояния для рендера ячеек. */
export interface CellActions {
  setActiveCell(cell: TableActiveCell): void;
  setValue(columnID: TableColumnID, recordID: TableRecordID, value: any): void;
  startEdit(columnID: TableColumnID, recordID: TableRecordID): void;
  moveCellHorizontal(by: number, to?: number): void;
  openLinkedTable(columnID: TableColumnID): void;
}

/* --- Table Editing --- */

/** Список ошибок при валидации записи. */
export type RowErrors = RowValidationError[];

/** Ошибка валидации записи. Типы:
 * + `null-value` — отсутствует обязательное значение
 * */
export interface RowValidationError {
  type: 'null-value';
  columnID: TableColumnID;
}

/** Объект с типом и данными обновления таблицы. */
export type SaveTableMetadata = InsertRowMetadata | UpdateRowMetadata;

/** Данные о добавлении новой записи в таблицу. */
interface InsertRowMetadata {
  type: 'insert';
  formID: FormID;
  rowID: TableRecordID;
  row: ChannelRow;
}

/** Данные об обновлении записи в таблицы. */
interface UpdateRowMetadata {
  type: 'update';
  formID: FormID;
  rowID: TableRecordID;
  row: ChannelRow;
}

/* --- Edit Panel --- */

/** Пропс для компонентов панели таблицы. */
export interface EditPanelItemProps {
  id: FormID;
  state: TableState;
  t: TFunction;
}
