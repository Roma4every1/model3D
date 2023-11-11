/** Состояния форм просмотра файлов. */
type FileViewStates = FormDict<FileViewState>;

/** Состояние формы просмотра файлов.
 * + `model`: {@link FileViewModel}
 * + `memo`: {@link FileViewModel}[]
 * + `useResources: boolean`
 * + `loading: boolean`
 * + `loadingFlag: {current: number}`
 * */
interface FileViewState {
  /** Текущий просматриваемый файл. */
  model: FileViewModel;
  /** Сохранённые файлы (только при `useResources: true`). */
  memo: FileViewModel[];
  /** Хранится ли содержимое файлов в файловой системе сервера. */
  useResources: boolean;
  /** Текущий флаг загрузки. */
  loadingFlag: {current: number};
}

/** Модель просматриваемого файла.
 * + `fileName: string`
 * + `fileType: string`
 * + `data`: {@link Blob}
 * + `uri: string` — техническое поле
 * */
interface FileViewModel<T = any> {
  /** Название файла. */
  fileName: string;
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
  /** Адрес ячейки (Например `B12`). */
  address: string;
  /** CSS стили ячейки. */
  style: CSSProperties;
  /** Количество рядов объедниямых ячейкой. */
  rowSpan: number | null;
  /** Количество колонок объедниямых ячейкой. */
  colSpan: number | null;
  /** Значение ячейки. */
  value: string | number;
}

/** Модель CSV файла. */
type FileModelCSV = string[][];
