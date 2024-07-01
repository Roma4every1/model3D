/** ID записи в таблице. */
type TableRecordID = number;
/** ID колонки в таблице; определяется по названию свойства. */
type TableColumnID = string;

/** Строка таблицы.
 *
 * Технические свойства:
 * + `id`: {@link TableRecordID} — идентификатор
 * + `selected: boolean` — выделение
 * + `cells: any[]` — оригинальные значения
 * + `style: CSSProperties` — переопределяемые CSS свойства ячеек
 */
type TableRecord = Record<TableColumnID, any>;

/** Хранилище состояний таблиц. */
type TableStates = Record<FormID, TableState>;

/** Состояние табличной формы. (dataset). */
interface TableState {
  /** Класс, отвечающий работу с записями таблицы. */
  recordHandler: ITableRecordHandler;
  /** ID для API редактирования записей. */
  queryID: QueryID;
  /** Название канала, который визуализируется. */
  channelName: ChannelName;
  /** Параметр, связанный с текущей активной строкой таблицы. */
  activeRecordParameter: ParameterID | undefined;
  /** Является ли таблица редактируемой. */
  editable: boolean;
  /** Настройки отображаемых свойств канала. */
  properties: ChannelProperty[];
  /** Настройки панели инструментов. */
  toolbarSettings: TableToolbarSettings;
  /** Глобальные настройки колонок таблицы. */
  columnsSettings: TableColumnsSettings;
  /** Правила установки заголовков колонок. */
  headerSetterRules: HeaderSetterRule[];
  /** Состояние колонок. */
  columns: TableColumnsState;
  /** Дерево колонок: отображает группировку, видимость и названия. */
  columnTree: ColumnTree;
  /** Массив **упорядоченных** ID колонок. */
  columnTreeFlatten: TableColumnID[];
  /** Состояние выделения таблицы. */
  selection: TableSelection;
  /** Информация об активной ячейке. */
  activeCell: TableActiveCell;
  /** Состояние редактирования таблицы. */
  edit: TableEditState;
  /** Количество записей в таблице. */
  total: number;
}

/** Класс, отвечающий работу с записями таблицы. */
interface ITableRecordHandler {
  setColumns(columns: TableColumnsState, channelColumns?: ChannelColumn[]): void;
  setLookupData(lookupData: ChannelDict): void;
  setColumnAutoWidth(id: TableColumnID): void;

  createRecord(id: TableRecordID, cells: any[]): TableRecord;
  createRecords(data: ChannelData): TableRecord[];
  validateRecord(record: TableRecord): any[]; // RowErrors
  rollbackRecord(record: TableRecord): void;
  applyRecordEdit(record: TableRecord): void;
}

type TableToolbarSettings = Partial<Record<TableToolbarElementID, boolean>>;

type TableToolbarElementID =
  'exportToExcel' | 'first' | 'last' | 'prev' | 'next' |
  'add' | 'remove' | 'accept' | 'reject' | 'refresh';

/** Глобальные настройки колонок таблицы. */
interface TableColumnsSettings {
  /** Количество закреплённых колонок. */
  lockedCount: number;
  /** Активен ли режим закрепления колонок. */
  isLockingEnabled: boolean;
  /** Доступно ли закрепление столбцов через GUI. */
  canUserLockColumns: boolean;
  /** Если `false`, то используется режим одной записи. */
  tableMode: boolean;
  /** Если `true`, то строки раскрашиваются через 1 другим цветом. */
  alternate: boolean;
  /** Цвет раскраски, связанный с `alternate`. */
  alternateBackground: string;
}

/** Правило установки заголовка колонки. */
interface HeaderSetterRule {
  /** ID параметра, вычисленное по названию. */
  id?: ParameterID;
  /** Название параметра системы `(tableRow)` для установки значения. */
  parameter: string;
  /** Свойства **канала**, которому соответствует изменяемая колонка. */
  property: string;
  /** Название колонки **параметра**, значение которого устанавливается как название столбца. */
  column: string;
}

/** Состояние колонок в таблице. */
type TableColumnsState = Record<TableColumnID, TableColumnState>;

/** Состояние колонки в таблице. */
interface TableColumnState {
  /** ID поля, которому в массиве строк соответствуют данные колонки. */
  field: TableColumnID;
  /** Заголовок. */
  title: string;
  /** Ширина колонки (если 1, то автоподбор). */
  width: number;
  /** Активен ли автоподбор ширины. */
  autoWidth: boolean;
  /** Закреплена ли колонка. */
  locked: boolean;
  /** Запрещено ли колонку редактировать. */
  readOnly: boolean;
  /** Тип колонки. */
  type?: TableColumnType;
  /** Формат записи. */
  format?: string;
  /** Имя колонки **в данных канала**. */
  colName?: ColumnName;
  /** Индекс колонки **в данных канала**. */
  colIndex?: number;
  /** Может ли ячейка быть пустой. */
  allowNull?: boolean;
  /** Название канала-справочника. */
  lookupChannel?: ChannelName;
  /** Словарь данных канала-справочника. */
  lookupDict?: LookupDict;
  /** Данные из канала-справочника. */
  lookupData?: LookupList | LookupTree;
  /** Название канала для привязанной таблицы. */
  detailChannel?: ChannelName;
}

/** Поддерживаемые типы колонок.
 * + `bool` — булево значение
 * + `int`  — целое число
 * + `real` — действительное число
 * + `text` — текст (строка)
 * + `date` — дата
 * + `list` — выборочное значение из **списка**
 * + `tree` — выборочное значение из **дерева**
 */
type TableColumnType = 'bool' | 'int' | 'real' | 'text' | 'date' | 'list' | 'tree';

/** Дерево колонок таблицы. */
type ColumnTree = ColumnTreeItem[];

/** Элемент дерева колонок таблицы.
 * + `title: string`
 * + `paramTitle?: string`
 * + `visible: boolean`
 * + `field?: string` — есть только у листьев
 * + `children`: {@link ColumnTreeItem}[] — есть только у групп
 */
interface ColumnTreeItem {
  title: string;
  paramTitle?: string;
  visible: boolean;
  field?: TableColumnID;
  children?: ColumnTreeItem[];
}

/** Состояние выделения: ключи — id выделенных строк. */
type TableSelection = Record<TableRecordID, true>;

/** Состояние активной ячейки.
 * + `columnID:` {@link TableColumnID} `| null`
 * + `recordID:` {@link TableRecordID} `| null`
 * + `edited: boolean`
 */
interface TableActiveCell {
  /** ID колонки */
  columnID: TableColumnID | null;
  /** ID строки */
  recordID: TableRecordID | null;
  /** Редактируется ли. */
  edited: boolean;
}

/** Состояние редактирования таблицы.
 * + `isNew: boolean`
 * + `modified: boolean`
 */
interface TableEditState {
  /** Является ли редактируемая запись новой. */
  isNew: boolean;
  /** Изменялась ли уже редактируемая запись. */
  modified: boolean;
}
