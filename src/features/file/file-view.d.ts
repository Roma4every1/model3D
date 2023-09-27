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
interface FileViewModel {
  /** Название файла. */
  fileName: string;
  /** Расширение файла. */
  fileType: string;
  /** Содержимое файла. */
  data: Blob;
  /** Моковая ссылка. */
  uri: string;
}

/** Параметры рендерера файла.
 * + `model: string` — модель просматриваемого файла
 * */
interface FileRendererProps {
  model: FileViewModel
}
