/** Состояние формы просмотра файлов. */
interface FileViewState {
  /** Свойство канала, в котором лежат данные файла. */
  readonly fileProperty: ChannelProperty;
  /** Текущий флаг загрузки. */
  readonly loadingFlag: {current: number};
  /** Текущий просматриваемый файл. */
  model: FileViewModel;
  /** Сохранённые файлы. */
  memo: FileViewModel[];
  /** Идентификатор текущего датасета. */
  queryID: QueryID | null;
}

/** Модель просматриваемого файла. */
interface FileViewModel<T = any> {
  /** Запись из датасета. */
  readonly row: ChannelRow;
  /** Название файла. */
  readonly fileName: string;
  /** Расширение файла. */
  fileType: string;
  /** Данные файла в двоичном виде. */
  data: Blob;
  /** Моковая ссылка. */
  uri: string;
  /** Модель содержимого в зависимости от типа. */
  content?: T;
  /** Индикатор загрузки. */
  loading: boolean;
}

/** Парсер конкретного типа файла. */
type FileParser<T = any> = (data: Blob) => Promise<T>;

/** Модель Excel файла. */
interface FileModelExcel {
  /** Листы. */
  sheets: ExcelSheetModel[];
}

/** Модель Excel страницы. */
interface ExcelSheetModel {
  /** Ключ. */
  key: string;
  /** Имя. */
  name: string;
  /** Строки. */
  rows: ExcelSheetRowModel[];
  /** Колонки. */
  columns: ExcelColumnModel[];
}

/** Модель Excel колонки. */
interface ExcelColumnModel {
  /** Ключ. */
  key: string;
  /** Ширина колонки. */
  width: number;
  /** Буквенный колонки. */
  letter: string;
}

/** Модель Excel ряда. */
interface ExcelRowModel {
  /** Ключ. */
  key: string;
  /** Номер ряда. */
  number: number;
  /** Высота ряда. */
  height: number;
  /** Ячейки ряда. */
  cells: ExcelCellModel[];
}

/** Модель Excel ячейки. */
interface ExcelCellModel {
  /** Адрес ячейки (например, `B12`). */
  address: string;
  /** CSS стили ячейки. */
  style: any; // CSSProperties
  /** Количество рядов объедниямых ячейкой. */
  rowSpan: number | null;
  /** Количество колонок объедниямых ячейкой. */
  colSpan: number | null;
  /** Значение ячейки. */
  value: string | number;
}

/** Модель CSV файла. */
type FileModelCSV = string[][];
