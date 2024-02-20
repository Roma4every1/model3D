import { Dispatch } from 'redux';
import { TFunction } from 'react-i18next';


/** Серверный формат настроек формы **DataSet**. */
export interface TableFormSettings {
  id: FormID;
  columns: DataSetColumnsSettings;
  attachedProperties: InitAttachedProperties;
  headerSetterRules: HeaderSetterRule[];
}

/** Настройки отображаемых свойств канала.
 * @example
 * {attachOption: "AttachAll", exclude: ["CODE"]}
 * */
export type InitAttachedProperties = Omit<AttachedProperties, 'list'>;

interface DataSetColumnsSettings {
  columnsSettings: DataSetColumnSettings[];
  frozenColumnCount: number;
  canUserFreezeColumns: boolean;
  isTableMode: boolean;
  alternate: boolean;
  alternateRowBackground: any;
  RowStyleSelector: RowStyleRule[];
}

export interface DataSetColumnSettings {
  channelPropertyName: string;
  displayName: string;
  headerBackground: string;
  headerForeground: string;
  background: string;
  foreground: string;
  typeFormat: string;
  width: number;
  isReadOnly: boolean;
  isHeaderRotated: boolean;
  hideIfEmpty: boolean;
  displayIndex: number;
  isVisible: boolean;
  isContainsSearchMode: boolean;
}

export interface RowStyleRule {
  type: RowStyleConditionType;
  param: string;
  propertyName: string;
  background: ColorHEX;
  foreground: ColorHEX;
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
  row: ChannelRow;
}

/** Данные об обновлении записи в таблицы. */
interface UpdateRowMetadata {
  type: 'update';
  formID: FormID;
  row: ChannelRow;
}

/* --- Edit Panel --- */

/** Пропс для компонентов панели таблицы. */
export interface EditPanelItemProps {
  id: FormID;
  state: TableState;
  dispatch: Dispatch<any>;
  t: TFunction;
}
