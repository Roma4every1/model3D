/** ID записи в таблице. */
type TableRecordID = number;

/** ID колонки в таблице; определяется по названию свойства. */
type TableColumnID = string;

/** Строка таблицы.
 *
 * Технические свойства:
 * + `id`: {@link TableRecordID} — идентификатор
 * + `selected: boolean` — выделение
 * + `cell: any[]` — оригинальные значения
 * */
type TableRecord = Record<TableColumnID, any>;

/** Хранилище состояний таблиц. */
type TablesState = Record<FormID, TableState>;

/** Состояние табличной формы. (dataset). */
interface TableState {
  /** ID для API редактирования записей. */
  tableID: TableID,
  /** Название канала, который визуализируется. */
  channelName: ChannelName,
  /** Является ли таблица редактируемой. */
  editable: boolean,
  /** Настройки отображаемых свойств канала. */
  properties: AttachedProperties,
  /** Глобальные настройки колонок таблицы. */
  columnsSettings: TableColumnsSettings,
  /** Правила установки заголовков колонок. */
  headerSetterRules: HeaderSetterRule[],
  /** Состояние колонок. */
  columns: TableColumnsState,
  /** Дерево колонок: отображает группировку, видимость и названия. */
  columnTree: ColumnTree,
  /** Массив **упорядоченных** ID колонок. */
  columnTreeFlatten: TableColumnID[],
  /** Состояние выделения таблицы. */
  selection: TableSelection,
  /** Информация об активной ячейке. */
  activeCell: TableActiveCell,
  /** Состояние редактирования таблицы. */
  edit: TableEditState,
  /** Количество записей в таблице. */
  total: number,
}

/** Ифнормация о свойствах колонок таблицы.
 * + `attachOption`: {@link AttachOptionType}
 * + `exclude: string[]`
 * + `list`: {@link ChannelProperty}[]
 * + `typesApplied: boolean`
 * */
interface AttachedProperties {
  /** Опция присоединения свойств колонок таблицы. */
  attachOption: AttachOptionType,
  /** Список исключений для */
  exclude: string[],
  /** Итоговый список свойств, составленный по `attachOption` и `exclude`. */
  list: ChannelProperty[],
  /** Учтены ли типы данных колонок в состоянии таблицы. */
  typesApplied: boolean,
}

/** Опция присоединения свойств колонок таблицы.
 * + `AttachAll` — все, кроме указанных в `exclude`
 * + `AttachNothing` — только те, что указанны в `exclude`
 * */
type AttachOptionType = 'AttachAll' | 'AttachNothing';

/** Глобальные настройки колонок таблицы. */
interface TableColumnsSettings {
  /** Количество закреплённых колонок. */
  lockedCount: number,
  /** Активен ли режим закрепления колонок. */
  isLockingEnabled: boolean,
  /** Доступно ли закрепление столбцов через GUI. */
  canUserLockColumns: boolean,
  /** Всегда `true`, серверная настройка; на клиенте не используется. */
  isTableMode: boolean,
  /** Если `true`, то строки раскрашиваются через 1 другим цветом. */
  alternate: boolean,
  /** Цвет раскраски, связанный с `alternate`. */
  alternateRowBackground: string,
}

/** Правило установки заголовка колонки. */
interface HeaderSetterRule {
  /** Параметр системы `(tableRow)` для установки значения. */
  parameter: ParameterID,
  /** Свойства **канала**, которому соответствует изменяемая колонка. */
  property: string,
  /** Название колонки **параметра**, значение которого устанавливается как название столбца. */
  column: string,
}

/** Состояние колонок в таблице. */
type TableColumnsState = Record<TableColumnID, TableColumnState>;

/** Состояние колонки в таблице. */
interface TableColumnState {
  /** ID поля, которому в массиве строк соответствуют данные колонки. */
  field: TableColumnID,
  /** Заголовок. */
  title: string,
  /** Ширина колонки (если 1, то автоподбор). */
  width: number,
  /** Активен ли автоподбор ширины. */
  autoWidth: boolean,
  /** Закреплена ли колонка. */
  locked: boolean,
  /** Запрещено ли колонку редактировать. */
  readOnly: boolean,
  /** Тип колонки. */
  type?: TableColumnType,
  /** Формат записи. */
  format?: string,
  /** Имя колонки **в данных канала**. */
  colName?: string,
  /** Индекс колонки **в данных канала**. */
  colIndex?: number,
  /** Может ли ячейка быть пустой. */
  allowNull?: boolean,
  /** Название канала-справочника. */
  lookupChannel?: ChannelName,
  /** Словарь данных канала-справочника. */
  lookupDict?: LookupDict,
  /** Данные из канала-справочника. */
  lookupData?: LookupList | LookupTree,
  /** Название канала для привязанной таблицы. */
  linkedTableChannel?: ChannelName,
}

/** Поддерживаемые типы колонок.
 * + `bool` — булево значение
 * + `int`  — целое число
 * + `real` — действительное число
 * + `text` — текст (строка)
 * + `date` — дата
 * + `list` — выборочное значение из **списка**
 * + `tree` — выборочное значение из **дерева**
 * */
type TableColumnType = 'bool' | 'int' | 'real' | 'text' | 'date' | 'list' | 'tree';

/** Дерево колонок таблицы. */
type ColumnTree = ColumnTreeItem[];

/** Элемент дерева колонок таблицы.
 * + `title: string`
 * + `paramTitle?: string`
 * + `visible: boolean`
 * + `field?: string` — есть только у листьев
 * + `children`: {@link ColumnTreeItem}[] — есть только у групп
 * */
interface ColumnTreeItem {
  title: string,
  paramTitle?: string,
  visible: boolean,
  field?: TableColumnID,
  children?: ColumnTreeItem[],
}

/** Состояние выделения: ключи — id выделенных строк. */
type TableSelection = Record<TableRecordID, true>;

/** Состояние активной ячейки.
 * + `columnID:` {@link TableColumnID} `| null`
 * + `recordID:` {@link TableRecordID} `| null`
 * + `edited: boolean`
 * */
interface TableActiveCell {
  /** ID колонки */
  columnID: TableColumnID | null,
  /** ID строки */
  recordID: TableRecordID | null,
  /** Редактируется ли. */
  edited: boolean,
}

/** Состояние редактирования таблицы.
 * + `isNew: boolean`
 * + `modified: boolean`
 * */
interface TableEditState {
  /** Является ли редактируемая запись новой. */
  isNew: boolean,
  /** Изменялась ли уже редактируемая запись. */
  modified: boolean,
}
