/** Состояние форм списков файлов. */
type FileListStates = FormDict<FileListState>;

/** Состояние формы списка файлов. */
interface FileListState {
  /** Имя активного файла. */
  activeFile: string | null;
}
