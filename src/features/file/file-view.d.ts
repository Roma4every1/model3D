/** Состояния форм просмотра файлов. */
type FileViewStates = FormDict<FileViewState>;

/** Состояние формы просмотра файлов.
 * + `model`: {@link FileViewModel}
 * + `memo`: {@link FileViewModel}[]
 * + `useResources: boolean`
 * */
interface FileViewState {
  /** Текущий просматриваемый файл. */
  model: FileViewModel;
  /** Сохранённые файлы (только при `useResources: true`). */
  memo: FileViewModel[];
  /** Хранится ли содержимое файлов в файловой системе сервера. */
  useResources: boolean;
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
}

/** Парсер конкретного типа файла. */
type FileParser<T = any> = (data: Blob) => Promise<T>;

/** Модель Excel файла. */
interface FileModelExcel {
  /** Листы. */
  sheets: any[];
  /** Цветовая тема документа. */
  colorScheme: string[];
}

/** Модель CSV файла. */
type FileModelCSV = string[][];
