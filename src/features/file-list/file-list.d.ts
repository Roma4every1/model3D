/** Состояние форм списков файлов. */
type FileListStates = Record<FormID, FileListState>;

/** Состояние формы списка файлов. */
type FileListState = Record<never, never>; // empty object
