/** DTO настроек табличной формы. */
export interface TableSettingsDTO {
  /** ID формы (используется только при передаче на сервер). */
  readonly id: FormID;
  /** Настройки видимости элементов на панели инструментов. */
  readonly toolbar?: TableToolbarSettings;
  /** Данные плагина `tableColumnsSettings`. */
  readonly columnSettings?: TableViewSettingsDTO;
  /** Правила динамических заголовков колонок. */
  readonly headerSetterRules?: HeaderSetterDTO[];
  /** Подключён ли плагин экспорта в Excel. */
  readonly exportToExcel?: boolean;
  /** Подключён ли плагин статистики. */
  readonly stat?: boolean;
  /** Подключён ли плагин выделения всех записей. */
  readonly selection?: boolean;
  /** Подключён ли плагин видимости колонок. */
  readonly columnVisibility?: boolean;
}

/** Настройки видимости элементов на панели инструментов. */
export type TableToolbarSettings = Partial<Record<TableToolbarElementID, boolean>>;

/**
 * Элементы на панели инструментов таблицы:
 * + `exportToExcel` — экспорт в Excel
 * + `first` — в начало
 * + `last` — в конец
 * + `prev` — предыдущая строка
 * + `next` — следующая строка
 * + `add` — добавить запись
 * + `remove` — удалить выбранные записи
 * + `accept` — подтвердить изменения
 * + `reject` — отменить изменения
 * + `refresh` — обновить данные
 */
export type TableToolbarElementID =
  'exportToExcel' | 'first' | 'last' | 'prev' | 'next' |
  'add' | 'remove' | 'accept' | 'reject' | 'refresh';

/** DTO динамического заголовка колонки таблицы. */
export interface HeaderSetterDTO {
  /** Название свойства канала, которому соответствует изменяемая колонка. */
  readonly property: string;
  /** Название tableRow-параметра, используемого для установки значения. */
  readonly parameter: string;
  /** Колонка параметра, из которой берётся значение в качестве нового названия столбца. */
  readonly column: string;
}

/** DTO настроек отображения таблицы (плагин `tableColumnsSettings`). */
export interface TableViewSettingsDTO {
  /** Настройки отображения колонок. */
  readonly columns?: TableColumnSettingsDTO[];
  /** Настройки отображения групп колонок. */
  readonly columnGroups?: TableColumnGroupSettingsDTO[];
  /** Условия раскраски записей. */
  readonly rowStyleRules?: RowStyleDTO[];
  /** Форма также поддерживает показ в режиме одной записи. */
  readonly tableMode?: boolean;
  /** Флаг переноса текста в таблице. */
  readonly textWrap?: boolean;
  /** Если `true`, строки будут раскрашены через одну. */
  readonly alternate?: boolean;
  /** Задаёт второй цвет для раскраски строк через одну. */
  readonly alternateBackground?: string;
  /** Количество зафиксированных колонок (первые слева). */
  readonly fixedColumnCount?: number;
}

/** DTO настроек отображения колонки в таблице. */
export interface TableColumnSettingsDTO {
  /** Название свойства канала, для которого применяются настройки. */
  readonly property?: string;
  /** Название заголовка колонки. */
  readonly displayName?: string;
  /** Индекс порядка колонки. */
  readonly displayIndex?: number;
  /** Ширина колонки в пикселях, значение 1 означает автоподбор. */
  readonly width?: number;
  /** Цвет текста ячеек. */
  readonly foreground?: string;
  /** Фон ячеек. */
  readonly background?: string;
  /** Цвет текста ячейки заголовка. */
  readonly headerForeground?: string;
  /** Фон ячейки заголока. */
  readonly headerBackground?: string;
  /** Флаг видимости колонки. */
  readonly visible?: boolean;
  /** Флаг редактируемости колонки. */
  readonly readOnly?: boolean;
  /** Флаг возможности переноса текста. */
  readonly textWrap?: boolean;
  /** Формат значения; поддерживается только `Color`. */
  readonly typeFormat?: string;
}

/** DTO настроек группы колонок в таблице. */
export interface TableColumnGroupSettingsDTO {
  /** Код группы. */
  readonly name: string;
  /** Имя группы. */
  readonly displayName?: string;
  /** Цвет текста ячейки заголовка. */
  readonly headerForeground?: string;
  /** Фон ячейки заголовка. */
  readonly headerBackground?: string;
  /** Цвет границы для крайних ячеек в группе. */
  readonly borderColor?: string;
  /** Ширина границы для крайних ячеек в группе. */
  readonly borderWidth?: number;
}

/** DTO условия раскраски записи в таблице. */
export interface RowStyleDTO {
  /** Название свойства, откуда берутся ячейки для применения условия. */
  readonly property: string;
  /** Тип применения условия; поддерживаются значения `equal` и `not_empty`. */
  readonly type: string;
  /** Значение для сравнения при типе условия `equal`. */
  readonly parameter?: string;
  /** Цвет текста, который применится к записи, если условие выполнено. */
  readonly foreground?: string;
  /** Фон, который применится к записи, если условие выполнено. */
  readonly background?: string;
}
