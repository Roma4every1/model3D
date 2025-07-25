/** Запись таблицы. */
interface TableRecord {
  /** Идентификатор. */
  readonly id: TableRecordID;
  /** Порядковый номер. */
  index: number;
  /** Значения ячеек. */
  cells: ChannelRow;
  /** Исходные значения ячеек. */
  initCells?: ChannelRow;
  /** Значения ячеек, которые используются при рендере. */
  renderValues: Record<PropertyName, CellRenderValue>;
  /** Переопределяемые CSS-свойства ячеек. */
  style?: any; // CSSProperties;
}

/** Идентификатор записи в таблице. */
type TableRecordID = number | string;

/** Состояние активной ячейки. */
interface TableActiveCell {
  /** Индекс строки */
  row: number | null;
  /** ID колонки */
  column: PropertyName | null;
  /** Редактируется ли ячейка. */
  edited: boolean;
}

/**
 * Поддерживаемые типы колонок:
 * + `bool` — булево значение
 * + `int`  — целое число
 * + `real` — действительное число
 * + `text` — текст (строка)
 * + `date` — дата без времени
 * + `datetime` — дата со временем
 * + `list` — выборочное значение из **списка**
 * + `tree` — выборочное значение из **дерева**
 * + `color` — ячейка с цветом
 */
type TableColumnType =
  'bool' | 'int' | 'real' | 'text' | 'date' | 'datetime' | 'list' | 'tree' | 'color';

/**
 * Значение ячейки, используемое при рендере компонента.
 * + `bool` — `✔` или `✖`
 * + `int`, `real` — отформатированное число, приведённое к строке
 * + `text`, `color` — равно исходному значению
 * + `date`, `datetime` — отформатированная дата
 * + `list`, `tree` — значение полученное по справочнику
 * */
type CellRenderValue = string;

/**
 * Тип условия применения стиля к строке таблицы.
 * + `equal` — значение в указанной ячейке равно заданному
 * + `not_empty` — значение в указанной ячейке не пусто
 */
type RecordStyleRuleType = 'equal' | 'not_empty';
