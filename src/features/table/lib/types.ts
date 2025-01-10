import type { CSSProperties, MouseEvent } from 'react';
import type { TableToolbarSettings } from './dto.types';
import type { TableColumnFilter } from './filter.types';
import { TableColumns } from './table-columns';
import { TableData } from './table-data';
import { TableSelection } from './table-selection';
import { TableViewportController } from './table-viewport';


/** Хранилище состояний таблиц. */
export type TableStates = Record<FormID, TableState>;

/** Состояние табличной формы. */
export interface TableState {
  /** Идентификатор формы. */
  readonly id: FormID;
  /** ID канала, который визуализируется. */
  readonly channelID: ChannelID;
  /** ID каналов-справочников. */
  readonly lookupChannelIDs: ChannelID[];
  /** Обёртка для колонок. */
  readonly columns: TableColumns;
  /** Обёртка для данных. */
  readonly data: TableData;
  /** Состояние выделения записей. */
  readonly selection: TableSelection;
  /** Контроллер вьюпорта таблицы. */
  readonly viewport: TableViewportController;
  /** Объект для хранения функций-действий над таблицей. */
  readonly actions: TableActions;
  /** Глобальные настройки колонок. */
  readonly globalSettings: TableGlobalSettings;
  /** Настройки панели инструментов. */
  readonly toolbarSettings: TableToolbarSettings;
  /** Параметр, связанный с текущей активной строкой таблицы. */
  readonly activeRecordParameter: ParameterID | undefined;
  /** Отдельное состояние для режима одной записи. */
  readonly recordMode?: RecordModeState;
}

/** Состояние формы в режиме одной записи. */
export interface RecordModeState {
  /** Ширина области с названиями колонок. */
  keyColumnWidth: number;
  /** Активная колонка. */
  activeColumn: PropertyName | null;
}

/** Объект для хранения функций-действий над таблицей. */
export interface TableActions {
  /** Клик по ячейке. */
  cellClick(row: number, column: PropertyName, e?: MouseEvent<HTMLTableCellElement>): void;
  /** Двигает активную ячейку вертикально; если `by > 0`, то вниз. */
  moveCellVertical(by: number, shiftKey?: boolean): void;
  /** Двигает активную ячейку горизотально; если `by > 0`, то вправо. */
  moveCellHorizontal(by: number | undefined, to?: number): void;
  /** Переместить выделение на первую запись. */
  moveToFirst(): void;
  /** Переместить выделение на последнюю запись. */
  moveToLast(): void;
  /** Добавление новой записи. */
  addRecord(copy: boolean, index?: number): void;
  /** Удаление выделенных записей. */
  deleteRecords(): void;
  /** Выход из режима редактирования. */
  endEdit(save: boolean): void;
}

/** Глобальные настройки колонок таблицы. */
export interface TableGlobalSettings {
  /** Если `false`, то используется режим одной записи. */
  readonly tableMode: boolean;
  /** Если false, фильтры для всех колонок игнорируются. */
  filterEnabled: boolean;
  /** Флаг переноса текста в таблице. */
  textWrap: boolean;
  /** Если `true`, то строки раскрашиваются через одну другим цветом. */
  alternate: boolean;
  /** Цвет раскраски, связанный с `alternate`. */
  alternateBackground?: ColorString;
}

/** Правило установки заголовка колонки. */
export interface HeaderSetterRule {
  /** Идентификатор параметра системы. */
  readonly id: ParameterID;
  /** Название параметра системы. */
  readonly name: ParameterName;
  /** Свойства **канала**, которому соответствует изменяемая колонка. */
  readonly property: PropertyName;
  /** Название колонки **параметра**, значение которого устанавливается как название столбца. */
  readonly column: string;
}

/** Условие, при выполнении которого у строки таблицы будут переопределены стили.  */
export interface RecordStyleRule {
  /** Колонка, по которой проверяется выполнение условия. */
  readonly property: PropertyName;
  /** Переопределяемые CSS-свойства. */
  readonly style: CSSProperties;
  /** Тип применения условия; поддерживаются значения `equal` и `not_empty`. */
  readonly type: string;
  /** Исходное значение для сравнения, прописанное в конфиге. */
  readonly sourceCompareValue: string | null;
  /** Тип данных колонки, по которой проверяется выполнение условия. */
  dataType?: DataTypeName;
  /** Значение, с которым сравнивается значение колонки. */
  compareValue: any;
}

/** Словарь моделей колонкок таблицы. */
export type TableColumnDict = Record<PropertyName, TableColumnModel>;
/** Словарь моделей гпупп колонкок таблицы. */
export type TableColumnGroupDict = Record<string, TableColumnGroupSettings>;

/** Настройки группы колонок. */
export interface TableColumnGroupSettings {
  /** Имя группы. */
  readonly displayName?: string;
  /** Стили для ячейки группы. */
  readonly style?: CSSProperties;
  /** Цвет границы для крайних ячеек в группе (не поддерживается). */
  readonly borderColor?: string;
  /** Ширина границы для крайних ячеек в группе (не поддерживается). */
  readonly borderWidth?: number;
}

/** Модель колонки таблицы. */
export interface TableColumnModel {
  /** Идентификатор колонки. */
  readonly id: PropertyName;
  /** Свойство канала, с которым связана колонка. */
  readonly property: ChannelProperty;
  /** Название для заголовка колонки. */
  readonly staticDisplayName: string;
  /** Стили ячейки заголовка. */
  readonly headerStyle?: CSSProperties;
  /** Стили ячеек. */
  readonly cellStyle?: CSSProperties;
  /** Формат значения; поддерживается только `Color`. */
  readonly typeFormat?: string;
  /** ID колонки, из которой берётся название файла. */
  readonly fileColumn?: PropertyName;
  /** Функция, которая форматирует значение ячейки. */
  formatter?: ColumnFormatter;

  /** Текущее название для заголовка колонки. */
  displayName: string;
  /** Порядковый номер колонки. */
  displayIndex: number | null;
  /** Индекс для задания порядка. */
  orderIndex: number;
  /** Ширина колонки в пикселях. */
  width: number;
  /** Флаг автоподбора ширины. */
  autoWidth: boolean;
  /** Фиксация колонки (только слева). */
  fixed: boolean;
  /** Флаг видимости. */
  visible: boolean;
  /** Флаг переноса текста в ячейках. */
  textWrap: boolean | undefined;

  /** Тип ячеек колонки. */
  type?: TableColumnType;
  /** Тип данных колонки. */
  dataType?: DataTypeName;
  /** Название колонки **в данных канала**. */
  columnName?: ColumnName;
  /** Индекс колонки **в данных канала**. */
  columnIndex?: number;
  /** Разрешены ли пустые ячейки в колонке. */
  nullable: boolean;
  /** Разрешено ли редактировать ячейки в колонке. */
  editable: boolean;
  /** Фильтр по колонке. */
  filter?: TableColumnFilter;

  /** ID канала детализации. */
  readonly detailChannel?: ChannelID;
  /** ID канала-справочника. */
  readonly lookupChannel?: ChannelID;
  /** Словарь данных канала-справочника. */
  lookupDict?: LookupDict;
  /** Данные из канала-справочника. */
  lookupData?: LookupList | LookupTree;
  /** ID запроса данных справочника. */
  lookupQueryID?: QueryID;
}

/** Функция, которая форматирует значение ячейки. */
export type ColumnFormatter = (value: any) => CellRenderValue;

/* --- Head Layout --- */

/** Макет заголовка таблицы. */
export type TableHeadLayout = TableHeadLayoutRow[];
/** Строка заголовка таблицы. */
export type TableHeadLayoutRow = TableHeadLayoutGroup[] | TableColumnModel[];

/** Ячейка группы в макете заголовка таблицы.  */
export interface TableHeadLayoutGroup {
  /** Продолжительность ячейки. */
  colSpan: number;
  /** Подпись; для фиктивных ячеек отсутствует. */
  displayName?: string;
  /** Стили ячейки. */
  style?: CSSProperties;
}

/* --- Table Editing --- */

/** Ошибка валидации записи таблицы. */
export interface RecordViolation {
  type: RecordViolationType;
  column: PropertyName;
}

/**
 * Тип ошибки валидации записи.
 * + `null-value` — отсутствует обязательное значение
 */
export type RecordViolationType = 'null-value';

/** Стандартизированный пропс для редактора ячейки. */
export interface CellEditorProps {
  /** Текущее состояние формы. */
  state: TableState;
  /** Колонка редактируемой ячейки. */
  column: TableColumnModel;
  /** Редактируемая запись. */
  record: TableRecord;
  /** Функция для обновления исходного значения ячейки. */
  update: (v: any) => void;
}
