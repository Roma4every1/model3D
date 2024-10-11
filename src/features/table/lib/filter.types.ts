/** Состояние фильтра колонки таблицы. */
export interface TableColumnFilter<T extends TableColumnType = TableColumnType> {
  /** Состояние элементов интерфейса. */
  state: TableColumnFilterState<T>;
  /** Элемент выражения фильтра, применяемый к колонке. */
  node: FilterNode | null;
  /** Если false, фильтр для колонки игнорируется. */
  enabled: boolean;
  /** Уникальные значения по колонке без учёта текущего фильтра. */
  uniqueValues?: any[] | 'loading';
}

/** Состояние элементов интерфейса для фильтра колонки таблицы. */
export type TableColumnFilterState<T extends TableColumnType = TableColumnType>
  = ColumnFilterStateMap[T];

interface ColumnFilterStateMap {
  'bool': BoolColumnFilterState;
  'int': NumberColumnFilterState;
  'real': NumberColumnFilterState;
  'text': StringColumnFilterState;
  'date': DateColumnFilterState;
  'list': LookupColumnFilterState;
  'tree': LookupColumnFilterState;
  'color': StringColumnFilterState;
}

/** Состояние фильтра колонки с логическим типом. */
export type BoolColumnFilterState = {value: boolean | undefined};
/** Состояние фильтра колонки с датой. */
export type DateColumnFilterState = CommonColumnFilterState<Date | undefined>;
/** Состояние фильтра численной колонки. */
export type NumberColumnFilterState = CommonColumnFilterState<number | undefined>;
/** Состояние фильтра строковой колонки. */
export type StringColumnFilterState = CommonColumnFilterState<string>;
/** Состояние фильтра колонки со справочником. */
export type LookupColumnFilterState = {values: Set<LookupItemID>};

export interface CommonColumnFilterState<T> {
  type1: FilterLeafType;
  value1: T;
  type2: FilterLeafType;
  value2: T;
  operator: 'or' | 'and';
}

export interface ColumnFilterOption {
  value: FilterLeafType;
  label: string;
  title?: string;
}
